import { Link } from "react-router-dom";

const ContactUs = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-gray-700">
      {/* Header */}
      <header className="border-b border-gray-200  pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Visit Us</h1>
        <p className="text-gray-600 mt-2">Our headquarters and manufacturing facility</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Contact Info */}
        <div className="lg:w-1/3 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800">Address</h3>
                <p>123 Shoe Street<br />
                Jajmau Industrial Area<br />
                Kanpur, Uttar Pradesh 208010<br />
                India</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800">Phone</h3>
                <p>+91 8989961490<br />
                +91 8603498711</p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800">Email</h3>
                <p><a href="mailto:support@luckyfootwear.com" className="text-blue-600 hover:underline">support@luckyfootwear.com</a></p>
              </div>

              <div>
                <h3 className="font-medium text-gray-800">Business Hours</h3>
                <p>Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 4:00 PM<br />
                Sunday: Closed</p>
              </div>
            </div>
          </section>

          <section className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Manufacturing Tours</h3>
            <p className="mb-4">We offer guided tours of our manufacturing facility where we craft our premium footwear.</p>
            <p>To schedule a tour, please contact us at least 48 hours in advance.</p>
          </section>
        </div>

        {/* Right Column - Map */}
        <div className="lg:w-2/3">
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg">
           <iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14226.08662037057!2d80.3478473!3d26.9235665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDU1JzI0LjgiTiA4MMKwMjAnNTIuMiJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
  width="100%"
  height="450"
  style={{ border: 0 }}
  allowFullScreen=""
  loading="lazy"
></iframe>
          </div>

          <div className="mt-6 bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Directions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-800">From Kanpur Central Railway Station</h4>
                <p>Take the Jajmau Road towards the industrial area. We're located approximately 8km from the station.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">By Road</h4>
                <p>We're easily accessible from the Kanpur-Lucknow highway. Look for the Lucky Footwear signage.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Parking</h4>
                <p>Visitor parking is available on-site.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-200 text-gray-600 text-sm">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>Since 2010, we've been crafting premium footwear that combines innovative comfort technology with timeless style.</p>
          
          </div>
          <div className="space-x-4">
            <Link to="/privacy-policy" className="text-gray-500 hover:text-gray-800 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-800 transition-colors">
              Terms of Service
            </Link>
           
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;