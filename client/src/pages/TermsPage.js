import React from 'react';
import './TermsPage.css';

function TermsPage() {
  return (
    <div className="terms-page">
      <div className="container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using ZimPharmHub, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily use ZimPharmHub for personal, non-commercial transitory viewing only.
            This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on ZimPharmHub</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept
            responsibility for all activities that occur under your account or password.
          </p>
        </section>

        <section>
          <h2>4. Job Listings and Applications</h2>
          <p>
            Pharmacies posting jobs are responsible for the accuracy of job listings. Job seekers are responsible for
            the accuracy of their applications and resumes. ZimPharmHub does not guarantee job placement or employment.
          </p>
        </section>

        <section>
          <h2>5. Payment Terms</h2>
          <p>
            Premium subscriptions and featured listings are charged according to our pricing structure. Payments are
            non-refundable unless otherwise stated. All fees are in Zimbabwean Dollars (ZWL).
          </p>
        </section>

        <section>
          <h2>6. Privacy</h2>
          <p>
            Your use of ZimPharmHub is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
          </p>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall ZimPharmHub or its suppliers be liable for any damages (including, without limitation,
            damages for loss of data or profit, or due to business interruption) arising out of the use or inability to
            use the materials on ZimPharmHub.
          </p>
        </section>

        <section>
          <h2>8. Revisions</h2>
          <p>
            ZimPharmHub may revise these terms of service at any time without notice. By using this website you are
            agreeing to be bound by the then current version of these terms of service.
          </p>
        </section>

        <section>
          <h2>9. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at support@zimpharmhub.com.
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsPage;

