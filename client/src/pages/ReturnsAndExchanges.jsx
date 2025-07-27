import { Link } from "react-router-dom";

const ReturnsAndExchanges = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="border-b border-gray-200 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Returns & Exchanges Policy</h1>
        <p className="text-gray-600 mt-2">Last Updated: June 17, 2025</p>
      </header>

      {/* Main Content */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Return Policy</h2>
          <p className="text-gray-700 mb-4">
            At Lucky Footwear, we want you to be completely satisfied with your purchase. If you're not happy with your order, we're happy to offer returns or exchanges within 30 days of delivery.
          </p>
          <p className="text-gray-700">
            Items must be unworn, in their original condition, and in the original packaging with all tags attached.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">How to Initiate a Return or Exchange</h2>
          <ol className="list-decimal pl-6 space-y-3 text-gray-700">
            <li>Contact our customer service team at <a href="mailto:support@luckyfootwear.com" className="text-blue-600 hover:underline">support@luckyfootwear.com</a> or call us at +91 8989961490 to request a return authorization.</li>
            <li>Pack the item(s) securely in the original packaging with all tags attached.</li>
            <li>Include the original invoice or packing slip.</li>
            <li>Ship the package to our return address (provided in your return authorization email).</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Return Shipping</h2>
          <p className="text-gray-700 mb-4">
            Customers are responsible for return shipping costs unless the return is due to our error (wrong item shipped, defective item, etc.).
          </p>
          <p className="text-gray-700">
            We recommend using a trackable shipping service as we cannot be responsible for lost return packages.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Refunds</h2>
          <p className="text-gray-700 mb-4">
            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
          </p>
          <p className="text-gray-700">
            If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 7-10 business days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Exchanges</h2>
          <p className="text-gray-700 mb-4">
            We currently offer exchanges for different sizes of the same item. If you need to exchange for a different item, we recommend returning your original purchase and placing a new order.
          </p>
          <p className="text-gray-700">
            To process an exchange, please follow the same steps as a return but indicate you would like an exchange when contacting customer service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Non-Returnable Items</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Customized or personalized products</li>
            <li>Items marked as "Final Sale"</li>
            <li>Worn or damaged items</li>
            <li>Items without original tags or packaging</li>
          </ul>
        </section>

        {/* Contact Information */}
        <div className="bg-gray-50 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Need Help?</h3>
          <p className="text-gray-700 mb-2">
            <strong>Customer Service Hours:</strong> Mon-Fri, 9am-6pm EST
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Phone:</strong> +91 8989961490 / +91 8603498711
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Email:</strong> <a href="mailto:support@luckyfootwear.com" className="text-blue-600 hover:underline">support@luckyfootwear.com</a>
          </p>
          <p className="text-gray-700">
            <strong>Return Address:</strong> 123 Shoe Street, Jajmau Industrial Area, Kanpur, Uttar Pradesh 208010, India
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200 text-gray-600 text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>Since 2010, we've been crafting premium footwear that combines innovative comfort technology with timeless style.</p>
            <p className="mt-2">© 2025 Lucky Footwear, Inc. All rights reserved.</p>
          </div>
          <div className="space-x-4">
            <Link to="/privacy-policy" className="text-gray-500 hover:text-gray-800 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-800 transition-colors">
              Terms of Service
            </Link>
            <Link to="/shipping" className="text-gray-500 hover:text-gray-800 transition-colors">
              Shipping Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReturnsAndExchanges;