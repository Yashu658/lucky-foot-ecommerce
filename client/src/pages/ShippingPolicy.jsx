import { Link } from "react-router-dom";

const ShippingPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-gray-700">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Shipping Policy</h1>
        <p className="text-gray-600">Last Updated: June 2025</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">1. Shipping Locations</h2>
          <p className="mb-4">
            We currently ship to all states across India. International shipping is available to select countries.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Domestic Shipping:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>All 28 states and 8 union territories</li>
                <li>PIN code verification during checkout</li>
                <li>Free shipping on orders over ₹2,000</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-800 mb-2">International Shipping:</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>USA, UK, Canada, UAE, Singapore</li>
                <li>Additional customs duties apply</li>
                <li>Delivery times vary by destination</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">2. Shipping Methods & Timeframes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left border">Service</th>
                  <th className="px-4 py-2 text-left border">Delivery Time</th>
                  <th className="px-4 py-2 text-left border">Price</th>
                  <th className="px-4 py-2 text-left border">Tracking</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border">Standard Shipping</td>
                  <td className="px-4 py-2 border">3-7 business days</td>
                  <td className="px-4 py-2 border">₹40 (Free over ₹2,000)</td>
                  <td className="px-4 py-2 border">Yes</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 border">Express Shipping</td>
                  <td className="px-4 py-2 border">1-3 business days</td>
                  <td className="px-4 py-2 border">₹120</td>
                  <td className="px-4 py-2 border">Yes</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">International Standard</td>
                  <td className="px-4 py-2 border">7-14 business days</td>
                  <td className="px-4 py-2 border">₹800+</td>
                  <td className="px-4 py-2 border">Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            * Delivery times are estimates and may vary based on location and weather conditions
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">3. Order Processing</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Orders placed before 2 PM IST are processed same business day</li>
            <li>Weekend/holiday orders ship next business day</li>
            <li>You'll receive email confirmation with tracking details</li>
            <li>Custom-made shoes require 3-5 additional processing days</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">4. Tracking Your Order</h2>
          <p className="mb-2">
            Once shipped, you can track your package:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Via the tracking link in your shipping confirmation email</li>
            <li>Through your account dashboard on our website</li>
            <li>By contacting our support team with your order number</li>
          </ul>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-medium text-blue-800">Pro Tip:</p>
            <p>Download the Delhivery/Bluedart app for real-time tracking updates and delivery notifications.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">5. Shipping Restrictions</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>We cannot ship to P.O. boxes</li>
            <li>Remote locations may require additional delivery time</li>
            <li>Certain high-value items require signature confirmation</li>
            <li>We reserve the right to refuse shipment to unsafe areas</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">6. Delivery Issues</h2>
          <p className="mb-2">
            If you experience any delivery problems:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Check tracking for current status</li>
            <li>Contact the carrier directly if package shows delivered but not received</li>
            <li>Report damaged packages within 24 hours of receipt</li>
            <li>For lost packages, wait 3 business days past estimated delivery before contacting us</li>
          </ul>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="font-medium text-yellow-800">Note:</p>
            <p>During festive seasons (Diwali, Christmas), please allow 2-3 additional business days for delivery.</p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">7. International Shipping Details</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Customers are responsible for all import duties and taxes</li>
            <li>Provide accurate recipient phone number for customs clearance</li>
            <li>International returns must be shipped back at customer's expense</li>
            <li>Some products may be restricted in certain countries</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">8. Contact Our Shipping Team</h2>
          <address className="not-italic">
            <strong>Lucky Footwear Shipping Department</strong><br />
            123 Shoe Street, Jajmau Industrial Area<br />
            Kanpur, Uttar Pradesh 208010, India<br /><br />
            
            <strong>Shipping Inquiries:</strong> <a href="mailto:shipping@luckyfootwear.com" className="text-blue-600">shipping@luckyfootwear.com</a><br />
            <strong>Phone Support:</strong> <a href="tel:+918989961490" className="text-blue-600">+91 8989961490</a> (Mon-Fri, 9am-6pm IST)<br />
            <strong>Live Chat:</strong> Available on our website during business hours
          </address>
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-gray-600">
              Since 2010, we've been delivering premium footwear across India and beyond.
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

export default ShippingPolicy;