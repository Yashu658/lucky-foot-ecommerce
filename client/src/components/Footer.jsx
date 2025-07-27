import { useState } from "react";
import {
  FaLinkedin,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaCcVisa,
  FaCcMastercard,
  FaCcApplePay,
} from "react-icons/fa";
import { SiPaypal, SiGooglepay } from "react-icons/si";
import { MdOutlineEmail, MdLocationOn, MdPhone } from "react-icons/md";
import { RiWhatsappFill } from "react-icons/ri";
import { BsArrowRightShort, BsCreditCard2Back } from "react-icons/bs";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const currentYear = new Date().getFullYear();

  const handleSubscribe = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|orkut\.com|yahoo\.com)$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    toast.success("Subscribed successfully!");
    setEmail(""); // Clear input
  };
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Text */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white bg-clip-text">
            Our journey doesn't end here
          </h2>
          <p className="text-gray-100 max-w-2xl mx-auto text-lg">
            Join our community for exclusive deals, style tips, and first access
            to new collections
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* About Column */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-yellow-400 font-bold text-3xl">L</span>
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <h3 className="text-xl font-bold text-white">Lucky Footwear</h3>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Since 2010, we've been crafting premium footwear that combines
              innovative comfort technology with timeless style.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="text-xl" />
              </a>
              <a
                 href="https://www.linkedin.com/in/yashu-sharma-16056b341/"
          target="_blank"
          rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="text-xl" />
              </a>
              <a
                href="https://wa.link/x3byjl"
              target="_blank"
              rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-500 transition-colors"
                aria-label="WhatsApp"
              >
                <RiWhatsappFill className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 pb-2 border-b border-gray-800">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                >
                  <BsArrowRightShort className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    Home
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/men"
                  className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                >
                  <BsArrowRightShort className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    Men's Collection
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/women"
                  className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                >
                  <BsArrowRightShort className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    Women's Collection
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/kids"
                  className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group"
                >
                  <BsArrowRightShort className="mr-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    Kids Collection
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/sale"
                  className="text-gray-400 hover:text-red-400 transition-colors flex items-center group"
                >
                  <BsArrowRightShort className="mr-2 text-red-400 opacity-0 group-hover:opacity-100 transition-all" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    Sale
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <Link to="/contact-us">
              <h3 className="text-xl font-bold text-white mb-6 pb-2 border-b border-gray-800">
                Contact Us
              </h3>
            </Link>

            <ul className="space-y-4">
              <li className="flex items-start">
                <Link to="/contact-us"
                className="text-gray-400 hover:text-white flex group">
                  <MdLocationOn className="text-xl mr-3 mt-1 text-blue-400 flex-shrink-0" />
                  <span className="group-hover:translate-x-1 transition-transform">
                    123 Shoe Street, Jajmau Industrial Area, Kanpur, Uttar
                    Pradesh 208010, India
                  </span>
                </Link>
              </li>
              <li className="flex items-center">
                <MdPhone className="text-xl mr-3 text-blue-400 flex-shrink-0" />
                <div>
                  <span className="text-gray-400 block">+91 8989961490 </span>
                  <span className="text-gray-400 block">+91 8603498711 </span>
                  <span className="text-gray-500 text-sm">
                    Mon-Fri, 9am-6pm EST
                  </span>
                </div>
              </li>
              <li className="flex items-center">
                <MdOutlineEmail className="text-xl mr-3 text-blue-400 flex-shrink-0" />
                <span className="text-gray-400">support@luckyfootwear.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 pb-2 border-b border-gray-800">
              Newsletter
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Subscribe to get 15% off your first order and exclusive access to
              new collections
            </p>
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-3 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full placeholder-gray-500"
                />
                <button
                  onClick={handleSubscribe}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-yellow-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm transition-colors"
                >
                  Subscribe
                </button>
              </div>
              <p className="text-gray-500 text-xs">
                By subscribing, you agree to our Privacy Policy and consent to
                receive updates.
              </p>
            </div>
          </div>
        </div>

        {/* Categories */}
        {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          {[
            {
              title: "Men",
              color: "text-blue-400",
              items: [
                "Running Shoes",
                "Casual Sneakers",
                "Dress Shoes",
                "Boots",
                "Sandals",
                "Slip-ons",
                "Loafers",
                "Athletic",
              ],
            },
            {
              title: "Women",
              color: "text-pink-400",
              items: [
                "Heels",
                "Flats",
                "Athleisure",
                "Boots",
                "Sandals",
                "Wedges",
                "Pumps",
                "Espadrilles",
              ],
            },
            {
              title: "Kids",
              color: "text-green-400",
              items: [
                "School Shoes",
                "Sneakers",
                "Sandals",
                "Rain Boots",
                "Athletic",
                "First Walkers",
                "Character Shoes",
              ],
            },
           
          ].map((category, index) => (
            <div key={index}>
              <h3 className={`text-lg font-semibold ${category.color} mb-4`}>
                {category.title}
              </h3>
              <ul className="space-y-2">
                {category.items.map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div> */}

        {/* Payment Methods */}
        <div className="flex flex-col items-center mb-8">
          <h4 className="text-gray-400 mb-6 text-sm uppercase tracking-wider">
            We Accept
          </h4>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-center">
              <FaCcVisa className="text-2xl text-gray-300" />
            </div>
            <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-center">
              <FaCcMastercard className="text-2xl text-gray-300" />
            </div>
            <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-center">
              <BsCreditCard2Back className="text-2xl text-gray-300" />
            </div>
            <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-center">
              <SiPaypal className="text-2xl text-gray-300" />
            </div>
            <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-center">
              <FaCcApplePay className="text-2xl text-gray-300" />
            </div>
            <div className="bg-gray-800 p-3 rounded-lg flex items-center justify-center">
              <SiGooglepay className="text-2xl text-gray-300" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} Lucky Footwear, Inc. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link
              to="/privacy-policy"
              className="text-gray-500 hover:text-white transition-colors text-sm"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-gray-500 hover:text-white transition-colors text-sm"
            >
              Terms of Service
            </Link>
            <Link
              to="/shipping-policy"
              className="text-gray-500 hover:text-white transition-colors text-sm"
            >
              Shipping Policy
            </Link>
            <Link
              to="/returns-exchanges"
              className="text-gray-500 hover:text-white transition-colors text-sm"
            >
              Returns & Exchanges
            </Link>
            <Link
              to="/accessibility"
              className="text-gray-500 hover:text-white transition-colors text-sm"
            >
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
