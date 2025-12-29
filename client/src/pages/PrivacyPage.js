import React from 'react';
import './PrivacyPage.css';

function PrivacyPage() {
  return (
    <div className="privacy-page">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            ZimPharmHub ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <p>We may collect personal information that you provide to us, including:</p>
          <ul>
            <li>Name and contact information (email, phone number)</li>
            <li>Account credentials (username, password)</li>
            <li>Profile information (bio, location, certifications)</li>
            <li>Resume and cover letters</li>
            <li>Payment information (processed securely through third-party providers)</li>
          </ul>

          <h3>2.2 Usage Information</h3>
          <p>We automatically collect information about how you use our platform, including:</p>
          <ul>
            <li>IP address and device information</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on pages</li>
            <li>Search queries</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process job applications and connect job seekers with employers</li>
            <li>Send you notifications about jobs, messages, and platform updates</li>
            <li>Process payments and manage subscriptions</li>
            <li>Communicate with you about your account or our services</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing</h2>
          <p>We may share your information in the following circumstances:</p>
          <ul>
            <li>
              <strong>With Employers:</strong> Job applications and profile information may be shared with
              pharmacy employers when you apply for jobs.
            </li>
            <li>
              <strong>Service Providers:</strong> We may share information with third-party service providers who
              assist us in operating our platform (payment processors, email services, etc.)
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose information if required by law or to protect
              our rights and the safety of our users.
            </li>
          </ul>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information
            against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
            over the internet is 100% secure.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Delete your account and personal information</li>
            <li>Opt-out of marketing communications</li>
            <li>Request a copy of your data</li>
          </ul>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our platform and hold certain
            information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>

        <section>
          <h2>8. Third-Party Links</h2>
          <p>
            Our platform may contain links to third-party websites. We are not responsible for the privacy practices
            of these external sites. We encourage you to review their privacy policies.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect personal
            information from children.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
            Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: privacy@zimpharmhub.com<br />
            Address: 123 Main Street, Harare, Zimbabwe
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPage;

