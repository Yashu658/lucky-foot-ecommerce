import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="border-t-2 border-surface-700 bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">Lucky Footwear</h3>
            <p className="text-surface-300">Wear your Luck</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-surface-300 hover:text-info">About Us</Link></li>
              <li><Link to="/contact" className="text-surface-300 hover:text-info">Contact</Link></li>
              <li><Link to="/shipping" className="text-surface-300 hover:text-info">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-surface-300 hover:text-info">Returns</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">Categories</h4>
            <ul className="space-y-2">
              <li><Link to="/men" className="text-surface-300 hover:text-info">Men's Collection</Link></li>
              <li><Link to="/women" className="text-surface-300 hover:text-info">Women's Collection</Link></li>
              <li><Link to="/kids" className="text-surface-300 hover:text-info">Kids Collection</Link></li>
              <li><Link to="/sale" className="text-surface-300 hover:text-info">Sale</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-primary">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-surface-300 hover:text-info" aria-label="Facebook">
                <FaFacebook size={24} />
              </a>
              <a href="#" className="text-surface-300 hover:text-info" aria-label="Twitter">
                <FaTwitter size={24} />
              </a>
              <a href="#" className="text-surface-300 hover:text-info" aria-label="Instagram">
                <FaInstagram size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-surface-700 mt-8 pt-8 text-center">
          <p className="text-surface-300">
            &copy; {new Date().getFullYear()} Lucky Footwear. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;