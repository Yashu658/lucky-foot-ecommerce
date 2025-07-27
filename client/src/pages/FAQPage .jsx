import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const FAQPage = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl text-gray-800 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-green-600 mb-6">
        Frequently Asked Questions
      </h2>

      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Why Lucky Footwear
          </h3>
          <p className="text-gray-700">
            Lucky Footwear is a leading premium lifestyle retailer in India and has
            partnered with great homegrown labels as well as globally renowned
            brands such as Nike, Adidas, New Balance, Asics, Puma and many more.
            Our goal is to bring the best of the world to you! As a
            community-first collective, Lucky Footwear has been the choice of many
            brands to foray into the country. We love what we represent,
            curating events & drops that promote the culture while being
            detail-orientated & fresh with our approach.
          </p>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            How do I find the right shoe size?
          </h3>
          <p className="text-gray-700">
            Use our size guide available on each product page. If you're between
            sizes, we recommend sizing up for comfort.
          </p>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            What is the return policy?
          </h3>
          <p className="text-gray-700">
            You can return unworn shoes within 14 days for a full refund. Items
            must be in original condition with all tags attached. See our full
            return policy for more details.
          </p>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            How do I clean my shoes?
          </h3>
          <p className="text-gray-700">
            For most shoes, use a damp cloth and mild soap. For sneakers, avoid
            the washing machine unless the care label specifically indicates
            it's safe. Let shoes air dry naturally.
          </p>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            How long does shipping take?
          </h3>
          <p className="text-gray-700">
            Standard delivery takes 3–5 business days. Express shipping options
            are available at checkout for faster delivery (1-2 business days).
          </p>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Can I gift wrap an order?
          </h3>
          <p className="text-gray-700">
            Yes! We offer premium gift wrapping and a personalized message
            option during checkout. Perfect for birthdays, anniversaries, and
            special occasions.
          </p>
        </div>
        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Do you ship internationally?
          </h3>
          <p className="text-gray-700">
            Yes, we ship worldwide! International shipping rates and delivery
            times vary by location and are calculated at checkout.
          </p>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Can I exchange instead of return?
          </h3>
          <p className="text-gray-700">
            Absolutely. If you need a different size or color, you can request
            an exchange. Exchanges must also be made within 14 days and meet our
            return conditions.
          </p>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            How can I track my order?
          </h3>
          <p className="text-gray-700">
            Once your order ships, we’ll email you a tracking link. You can also
            check your order status in your account dashboard.
          </p>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Are your shoes made with vegan materials?
          </h3>
          <p className="text-gray-700">
            Many of our collections are vegan-friendly. Check the product
            description for the "Vegan" label or filter products using the Vegan
            Materials tag.
          </p>
        </div>

        <div className="border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            How long will my shoes last?
          </h3>
          <p className="text-gray-700">
            With proper care, our shoes are designed to last for years.
            Longevity varies by usage and material— leather shoes last longer
            than canvas, for example.
          </p>
        </div>

        <div className="pt-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Still need help?
          </h3>
          <p className="text-gray-700 mb-4">
            Contact our customer support team for personalized assistance.
          </p>
          <a
            href="https://wa.link/x3byjl"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
