import { useState, useEffect } from 'react';
import axios from '../config/api';
import { useNavigate } from 'react-router-dom';

const PopupOfferModal = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupOffer, setPopupOffer] = useState(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPopupOffer = async () => {
      try {
        const lastPopupTime = localStorage.getItem('lastPopupTime');
        const currentTime = new Date().getTime();
        const oneHour = 60 * 60 * 1000;

        if (lastPopupTime && currentTime - parseInt(lastPopupTime) < oneHour) return;

        const response = await axios.get('/api/active');
        const popupOffers = response.data.offers.filter(o => o.offerType === 'popup');

        if (popupOffers.length > 0) {
          setPopupOffer(popupOffers[0]);
          setShowPopup(true);
        }
      } catch (error) {
        console.error('Error checking popup offers:', error);
      }
    };

    const timer = setTimeout(checkPopupOffer, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    if (dontShowAgain) {
      localStorage.setItem('lastPopupTime', new Date().getTime().toString());
    }
  };

  const handleShopNow = () => {
    if (popupOffer?.products?.length) {
      navigate({
        pathname: popupOffer.buttonLink || '/shop',
        search: `?offerProducts=${popupOffer.products.join(',')}`
      });
    } else {
      navigate(popupOffer.buttonLink || '/shop');
    }
    handleClose();
  };

  if (!showPopup || !popupOffer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl mx-4 md:mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          {popupOffer.imageUrl && (
            <div className="w-full md:w-1/2 h-64 mt-1 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img 
                src={popupOffer.imageUrl} 
                alt={popupOffer.title} 
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Info Section */}
          <div className="w-full md:w-1/2 p-6 space-y-4 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-gray-900">{popupOffer.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{popupOffer.description}</p>

            <div className="text-xl font-bold text-red-600">
              {popupOffer.discountValue}
              {popupOffer.discountType === 'percentage' ? '%' : '₹'} OFF
            </div>

            {popupOffer.couponCode && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">Use coupon:</p>
                <div className="inline-block bg-yellow-200 text-yellow-800 font-semibold px-4 py-1 rounded-lg tracking-wider">
                  {popupOffer.couponCode}
                </div>
              </div>
            )}

            <button
              onClick={handleShopNow}
              className="mt-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg transition-all duration-200"
            >
              {popupOffer.buttonText || 'Shop Now'}
            </button>

            <div className="flex items-center justify-center md:justify-start text-xs mt-4">
              <input
                id="dont-show"
                type="checkbox"
                className="mr-2"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <label htmlFor="dont-show" className="text-gray-500">Don't show again for an hour</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupOfferModal;
