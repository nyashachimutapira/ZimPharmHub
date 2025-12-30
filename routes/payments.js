const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_key');
const router = express.Router();
const Job = require('../models-sequelize/Job');
const Payment = require('../models-sequelize/Payment');
const SequelizeUser = require('../models-sequelize/User');
const { sendEmail } = require('../utils/mailer');

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd', description } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      description,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
});

// Upgrade subscription
router.post('/upgrade-subscription', async (req, res) => {
  try {
    const { userId, planType, amount } = req.body;

    // Create payment intent for subscription upgrade
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      description: `Subscription upgrade to ${planType}`,
      metadata: {
        userId,
        planType,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing subscription', error: error.message });
  }
});

// Feature a job listing using PaymentIntent (legacy / direct)
router.post('/feature-job', async (req, res) => {
  try {
    const { jobId, days, amount, userId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      description: `Feature job listing for ${days} days`,
      metadata: {
        jobId,
        days,
        userId: userId ? String(userId) : ''
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment', error: error.message });
  }
});

// Create a Stripe Checkout Session for featuring a job
router.post('/create-feature-checkout', async (req, res) => {
  try {
    const { jobId, days, userId } = req.body;
    const daysNum = Number(days) || 7;
    const pricePerDay = Number(process.env.FEATURE_PRICE_PER_DAY_USD || 5);
    const amount = Math.round(pricePerDay * daysNum * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Feature job for ${daysNum} day(s)` },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${jobId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${jobId}?canceled=true`,
      metadata: { jobId: String(jobId), days: String(daysNum), userId: userId ? String(userId) : '' }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout create error:', error);
    res.status(500).json({ message: 'Error creating checkout session', error: error.message });
  }
});

// Webhook handler for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // In dev/test environments, parse raw body into JSON if possible
      try {
        event = JSON.parse(req.body.toString());
      } catch (err) {
        event = req.body;
      }
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: 'Webhook Error', error: err.message });
  }

  // Handle the event
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata || {};
      const jobId = metadata.jobId;
      const days = Number(metadata.days) || 0;
      const userId = metadata.userId || null;

      if (jobId) {
        const job = await Job.findByPk(jobId);
        if (job) {
          job.featured = true;
          const now = new Date();
          const until = new Date(now.getTime() + (days * 24 * 3600 * 1000));
          job.featuredUntil = until;
          await job.save();

          // Determine payer email
          let payerEmail = session.customer_details && session.customer_details.email ? session.customer_details.email : null;
          let payerUser = null;
          if (userId) {
            payerUser = await SequelizeUser.findByPk(userId);
            if (payerUser && payerUser.email) payerEmail = payerUser.email;
          }

          // Record payment (store userId and receiptEmail if available)
          const payment = await Payment.create({ jobId, userId: userId || null, amount: session.amount_total / 100.0, currency: session.currency, provider: 'stripe', providerId: session.id, receiptEmail: payerEmail || null });

          // Send receipt to payer
          try {
            const amountHuman = (session.amount_total / 100.0).toFixed(2);
            const jobUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id}`;
            const payerLocale = payerUser && payerUser.locale ? payerUser.locale : (session.locale || 'en');
            await sendReceiptEmail({ recipientEmail: payerEmail, recipientName: payerUser ? `${payerUser.firstName} ${payerUser.lastName}` : payerEmail, jobTitle: job.title, amount: amountHuman, currency: session.currency, featuredUntil: until, jobUrl, locale: payerLocale });

            // mark payment receipt sent
            payment.receiptSent = true;
            payment.receiptSentAt = new Date();
            await payment.save();
          } catch (mailErr) {
            console.warn('Failed to send receipt email:', mailErr.message);
          }

          // Notify job owner if different from payer
          try {
            if (job.pharmacyId) {
              const owner = await SequelizeUser.findByPk(job.pharmacyId);
              if (owner && owner.email && (!payerUser || owner.id !== payerUser.id)) {
                const jobUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id}`;
                const ownerLocale = owner.locale || 'en';
                await sendOwnerNotification({ ownerEmail: owner.email, ownerName: `${owner.firstName} ${owner.lastName}`, jobTitle: job.title, featuredUntil: until, jobUrl, locale: ownerLocale });

                payment.ownerNotified = true;
                payment.ownerNotifiedAt = new Date();
                await payment.save();
              }
            }
          } catch (ownerMailErr) {
            console.warn('Failed to notify job owner:', ownerMailErr.message);
          }

          console.log(`Job ${jobId} featured until ${until.toISOString()}`);
        }
      }
    }

    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      const metadata = pi.metadata || {};
      const userId = metadata.userId || null;
      if (metadata.jobId && metadata.days) {
        const job = await Job.findByPk(metadata.jobId);
        if (job) {
          job.featured = true;
          const now = new Date();
          const until = new Date(now.getTime() + (Number(metadata.days) * 24 * 3600 * 1000));
          job.featuredUntil = until;
          await job.save();

          // Record payment
          await Payment.create({ jobId: metadata.jobId, userId: userId || null, amount: pi.amount_received / 100.0, currency: pi.currency, provider: 'stripe', providerId: pi.id });

          // Send receipt to payer (if userId provided) or to receipt_email
          try {
            let payerEmail = pi.receipt_email || null;
            let payerUser = null;
            if (userId) {
              payerUser = await SequelizeUser.findByPk(userId);
              if (payerUser && payerUser.email) payerEmail = payerUser.email;
            }
            const payerLocale = payerUser && payerUser.locale ? payerUser.locale : (pi.locale || 'en');

            const amountHuman = (pi.amount_received / 100.0).toFixed(2);
            const subject = `Payment receipt — ${process.env.FRONTEND_NAME || 'ZimPharmHub'}`;
            const jobUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id}`;
            const text = `Thank you for your payment. Job: ${job.title}\nAmount: ${amountHuman} ${pi.currency}\nFeatured until: ${until.toDateString()}\nView job: ${jobUrl}`;
            const html = `<p>Thank you for your payment.</p><p><strong>Job:</strong> ${job.title}</p><p><strong>Amount:</strong> ${amountHuman} ${pi.currency}</p><p><strong>Featured until:</strong> ${until.toDateString()}</p><p><a href="${jobUrl}">View job</a></p>`;

            if (payerEmail) await sendReceiptEmail({ recipientEmail: payerEmail, recipientName: payerUser ? `${payerUser.firstName} ${payerUser.lastName}` : payerEmail, jobTitle: job.title, amount: amountHuman, currency: pi.currency, featuredUntil: until, jobUrl, locale: payerLocale });

            // Notify job owner if different
            if (job.pharmacyId) {
              const owner = await SequelizeUser.findByPk(job.pharmacyId);
              if (owner && owner.email && (!payerUser || owner.id !== payerUser.id)) {
                const ownerLocale = owner.locale || 'en';
                await sendOwnerNotification({ ownerEmail: owner.email, ownerName: `${owner.firstName} ${owner.lastName}`, jobTitle: job.title, featuredUntil: until, jobUrl, locale: ownerLocale });
              }
            }
          } catch (mailErr) {
            console.warn('Failed to send receipt/owner email:', mailErr.message);
          }

          console.log(`Payment succeeded — job ${metadata.jobId} featured until ${until.toISOString()}`);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error handling webhook event:', err.message);
    res.status(500).json({ message: 'Error processing webhook', error: err.message });
  }
});

module.exports = router;
