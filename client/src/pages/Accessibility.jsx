import { Link } from "react-router-dom";

const Accessibility = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-gray-700">
      {/* Header */}
      <header className="border-b border-gray-200 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Accessibility Statement</h1>
        <p className="text-gray-600 mt-2">Last Updated: June 17, 2025</p>
      </header>

      {/* Main Content */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Commitment</h2>
          <p className="mb-4">
            Lucky Footwear is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Conformance Status</h2>
          <p className="mb-4">
            The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. We aim to meet WCAG 2.1 Level AA standards for our website.
          </p>
          <p>
            While we strive to adhere to these guidelines, some areas of our website may not yet be fully accessible. We are actively working to improve these areas.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Accessibility Features</h2>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Keyboard navigation support throughout the site</li>
            <li>Alternative text for meaningful images</li>
            <li>Responsive design that adapts to different screen sizes</li>
            <li>Clear and consistent navigation structure</li>
            <li>Adjustable text sizing (through browser controls)</li>
            <li>Sufficient color contrast for readability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Feedback</h2>
          <p className="mb-4">
            We welcome your feedback on the accessibility of Lucky Footwear's website. Please let us know if you encounter accessibility barriers:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Phone: +91 8989961490 / +91 8603498711</li>
            <li>Email: <a href="mailto:accessibility@luckyfootwear.com" className="text-blue-600 hover:underline">accessibility@luckyfootwear.com</a></li>
            <li>Postal address: 123 Shoe Street, Jajmau Industrial Area, Kanpur, Uttar Pradesh 208010, India</li>
          </ul>
          <p>
            We try to respond to feedback within 3-5 business days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Technical Specifications</h2>
          <p className="mb-4">
            The accessibility of Lucky Footwear's website relies on the following technologies:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>HTML</li>
            <li>WAI-ARIA</li>
            <li>CSS</li>
            <li>JavaScript</li>
          </ul>
          <p>
            These technologies are used in combination with the accessibility features of modern web browsers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ongoing Efforts</h2>
          <p className="mb-4">
            Our team is continuously working to improve accessibility by:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Regular accessibility audits of our website</li>
            <li>Training our staff on accessibility best practices</li>
            <li>Implementing accessibility improvements with each website update</li>
            <li>Monitoring new technologies that can enhance accessibility</li>
          </ul>
        </section>

        {/* Contact Information */}
        <div className="bg-gray-50 p-6 rounded-lg mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Accessibility Support</h3>
          <p className="mb-2">
            <strong>Customer Service Hours:</strong> Mon-Fri, 9am-6pm EST
          </p>
          <p className="mb-2">
            <strong>Accessibility Team:</strong> <a href="mailto:accessibility@luckyfootwear.com" className="text-blue-600 hover:underline">accessibility@luckyfootwear.com</a>
          </p>
          <p>
            <strong>Phone:</strong> +91 8989961490 (ask for Accessibility Support)
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
            <Link to="/accessibility" className="text-gray-500 hover:text-gray-800 transition-colors font-medium">
              Accessibility
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Accessibility;