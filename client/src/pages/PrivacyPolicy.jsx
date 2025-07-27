import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-700">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
        <p className="text-gray-600">Last Updated: June 2025</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Lucky Footwear ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <Link to="/" className="text-blue-600">luckyfootwear.com</Link>.
          </p>
          <p>
            Our registered office is located at: <br />
            <strong>123 Shoe Street, Jajmau Industrial Area, <br />
            Kanpur, Uttar Pradesh 208010, India</strong>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Personal Information:</strong> Name, email, phone number, shipping/billing address</li>
            <li><strong>Payment Information:</strong> Credit card details (processed securely via PCI-compliant providers)</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
            <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Process orders and deliver products</li>
            <li>Provide customer support (9am-6pm EST via phone/email)</li>
            <li>Improve our website and product offerings</li>
            <li>Send promotional communications (with opt-out option)</li>
            <li>Prevent fraud and enhance security</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">4. Data Sharing</h2>
          <p className="mb-2">We may share information with:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Shipping carriers (Delhivery, FedEx, etc.) for order fulfillment</li>
            <li>Payment processors (Razorpay, PayPal)</li>
            <li>Marketing platforms (Mailchimp, Google Analytics)</li>
            <li>When required by law or to protect our rights</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            We never sell your personal information to third parties.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Access, update, or delete your information</li>
            <li>Opt-out of marketing communications</li>
            <li>Request data portability</li>
            <li>Withdraw consent (where applicable)</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, contact us at <a href="mailto:privacy@luckyfootwear.com" className="text-blue-600">privacy@luckyfootwear.com</a> or call <a href="tel:+918989961490" className="text-blue-600">+91 8989961490</a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">6. Security Measures</h2>
          <p>
            We implement industry-standard security measures including:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>SSL/TLS encryption for all data transmissions</li>
            <li>Regular security audits</li>
            <li>Limited employee access to sensitive data</li>
            <li>Secure payment processing (PCI DSS compliant)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">7. Cookies & Tracking</h2>
          <p>
            We use cookies to:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Remember cart items and preferences</li>
            <li>Analyze website traffic</li>
            <li>Deliver targeted advertisements</li>
          </ul>
          <p className="mt-4">
            You can manage cookie preferences in your browser settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">8. Changes to This Policy</h2>
          <p>
            We may update this policy periodically. Significant changes will be notified via email or website notice. Continued use after changes constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800">9. Contact Us</h2>
          <p className="mb-2">
            For privacy-related inquiries:
          </p>
          <address className="not-italic">
            <strong>Lucky Footwear Pvt. Ltd.</strong><br />
            123 Shoe Street, Jajmau Industrial Area<br />
            Kanpur, Uttar Pradesh 208010, India<br /><br />
            
            <strong>Phone:</strong> <a href="tel:+918989961490" className="text-blue-600">+91 8989961490</a>, <a href="tel:+918603498711" className="text-blue-600">+91 8603498711</a><br />
            <strong>Hours:</strong> Mon-Fri, 9am-6pm EST<br />
            <strong>Email:</strong> <a href="mailto:support@luckyfootwear.com" className="text-blue-600">support@luckyfootwear.com</a><br />
            <strong>Privacy Officer:</strong> <a href="mailto:privacy@luckyfootwear.com" className="text-blue-600">privacy@luckyfootwear.com</a>
          </address>
          <p className="mt-4 text-sm text-gray-600">
            Since 2010, we've been crafting premium footwear that combines innovative comfort technology with timeless style.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            © 2025 Lucky Footwear, Inc. All rights reserved.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;