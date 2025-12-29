import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './FAQPage.css';

function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'Click on the "Sign Up" button in the navigation bar. Choose your user type (Job Seeker or Pharmacy) and fill in your details. You will receive a confirmation email to verify your account.',
    },
    {
      question: 'How do I post a job?',
      answer: 'First, create a pharmacy account. Once logged in, go to your dashboard and click "Post a Job". Fill in the job details including title, description, requirements, and salary. Your job will be reviewed and published.',
    },
    {
      question: 'How do I apply for a job?',
      answer: 'Browse available jobs on the Jobs page. Click on a job that interests you to view details. Click the "Apply Now" button and upload your resume and cover letter if required. You can track your application status in your dashboard.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit cards, debit cards, and mobile money payments through our secure Stripe payment gateway. All transactions are encrypted and secure.',
    },
    {
      question: 'How do I verify my pharmacy?',
      answer: 'To verify your pharmacy, you need to upload your pharmacy license and other required documents through your profile. Our team will review your documents and verify your account within 2-3 business days.',
    },
    {
      question: 'Can I save jobs for later?',
      answer: 'Yes! When viewing a job listing, click the "Save" button to add it to your saved jobs. You can access all your saved jobs from your dashboard.',
    },
    {
      question: 'How do I contact a pharmacy or job seeker?',
      answer: 'You can send messages directly through our messaging system. Go to the Messages section in your dashboard to start a conversation with another user.',
    },
    {
      question: 'What is the difference between free and premium accounts?',
      answer: 'Free accounts have basic features. Premium accounts get priority job listings, advanced analytics, unlimited job posts, and featured placement. Check our pricing page for details.',
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click on "Login" and then "Forgot Password". Enter your email address and you will receive instructions to reset your password.',
    },
    {
      question: 'How do I unsubscribe from newsletters?',
      answer: 'You can unsubscribe from newsletters by going to your profile settings and unchecking the newsletter subscription option, or by clicking the unsubscribe link at the bottom of any newsletter email.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="container">
        <h1>Frequently Asked Questions</h1>
        <p className="faq-intro">
          Find answers to common questions about ZimPharmHub. If you can't find what you're looking for, please contact us.
        </p>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className="faq-question"
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-contact">
          <h2>Still have questions?</h2>
          <p>Can't find the answer you're looking for? Please contact our support team.</p>
          <a href="/contact" className="btn-contact">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

export default FAQPage;

