import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-700">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Terms of Service</h1>
        <p className="text-gray-600">Last Updated: June 2025</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using the Lucky Footwear website (<Link to="/" className="text-blue-600">luckyfootwear.com</Link>), 
            you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part, 
            you may not access our services.
          </p>
          <p>
            <strong>Registered Office:</strong><br />
            123 Shoe Street, Jajmau Industrial Area,<br />
            Kanpur, Uttar Pradesh 208010, India
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">2. Account Registration</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>You must be at least 18 years old to create an account</li>
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the confidentiality of your account credentials</li>
            <li>Notify us immediately of any unauthorized account use</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">3. Product Information</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>We strive for accuracy but don't guarantee error-free product descriptions</li>
            <li>Colors may vary slightly due to monitor settings</li>
            <li>Shoe sizes follow standard Indian measurements (with conversion charts provided)</li>
            <li>Prices are in INR and subject to change without notice</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">4. Orders & Payments</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All orders are subject to product availability</li>
            <li>We accept:
              <ul className="list-circle pl-5 mt-2">
                <li>Credit/Debit Cards (Visa, MasterCard, RuPay)</li>
                <li>UPI Payments (PhonePe, Google Pay, etc.)</li>
                <li>Net Banking</li>
                <li>EMI Options (through our banking partners)</li>
              </ul>
            </li>
            <li>Payment is processed at order confirmation</li>
            <li>We reserve the right to refuse/cancel any order</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">5. Shipping & Delivery</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Standard delivery: 3-5 business days (metro cities), 5-7 days (other locations)</li>
            <li>Express delivery available at additional cost</li>
            <li>Delivery times are estimates, not guarantees</li>
            <li>International shipping available to select countries</li>
            <li>Customer responsible for any import duties/taxes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">6. Returns & Refunds</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>14-day return policy for unworn items in original condition</li>
            <li>Original tags and packaging must be intact</li>
            <li>Refunds processed within 7-10 business days</li>
            <li>Return shipping costs are customer's responsibility unless faulty product</li>
            <li>Final sale items marked "non-returnable" are excluded</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">7. Intellectual Property</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All website content (logos, designs, text) is our property</li>
            <li>Unauthorized use is prohibited</li>
            <li>Customer reviews/photos may be used for promotional purposes</li>
            <li>Report copyright infringement to <a href="mailto:legal@luckyfootwear.com" className="text-blue-600">legal@luckyfootwear.com</a></li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">8. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Use the site for illegal purposes</li>
            <li>Upload viruses or malicious code</li>
            <li>Attempt unauthorized access to our systems</li>
            <li>Harass other users or our staff</li>
            <li>Submit false information</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">9. Limitation of Liability</h2>
          <p className="mb-2">
            Lucky Footwear shall not be liable for:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Indirect, incidental, or consequential damages</li>
            <li>Errors or omissions in product information</li>
            <li>Delivery delays beyond our control</li>
            <li>Product misuse or normal wear and tear</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">10. Governing Law</h2>
          <p>
            These Terms shall be governed by Indian law. Any disputes shall be subject to the exclusive jurisdiction of courts in Kanpur, Uttar Pradesh.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">11. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. Continued use after changes constitutes acceptance. We'll notify users of significant changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">12. Contact Information</h2>
          <address className="not-italic">
            <strong>Lucky Footwear Pvt. Ltd.</strong><br />
            123 Shoe Street, Jajmau Industrial Area<br />
            Kanpur, Uttar Pradesh 208010, India<br /><br />
            
            <strong>Customer Support:</strong><br />
            <a href="tel:+918989961490" className="text-blue-600">+91 8989961490</a> | 
            <a href="tel:+918603498711" className="text-blue-600">+91 8603498711</a><br />
            <strong>Hours:</strong> Mon-Fri, 9am-6pm EST<br />
            <strong>Email:</strong> <a href="mailto:support@luckyfootwear.com" className="text-blue-600">support@luckyfootwear.com</a><br />
            <strong>Legal Inquiries:</strong> <a href="mailto:legal@luckyfootwear.com" className="text-blue-600">legal@luckyfootwear.com</a>
          </address>
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-gray-600">
              Since 2010, we've been crafting premium footwear that combines innovative comfort technology with timeless style.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              © 2025 Lucky Footwear, Inc. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;