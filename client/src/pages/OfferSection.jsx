// OfferSection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const OfferSection = ({ title, offers, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-sm text-gray-600">Loading offers...</p>
      </div>
    );
  }

  if (!offers?.length) return null;

  const isScrollable = offers.length >= 3;

  const handleShopNowClick = (offer) => {
    if (offer.products && offer.products.length > 0) {
      navigate(`/shop?offerProducts=${offer.products.join(",")}`);
    } else {
      navigate(offer.buttonLink || "/shop");
    }
  };

  return (
    <section className="py-6 w-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">{title}</h2>
<div className="flex justify-center w-full ml-30">
      {isScrollable ? (
        /* Scrollable horizontal list */
                  <div className="w-full max-w-6xl"> {/* Add max-width constraint */}
            <div className="flex overflow-x-auto scrollbar-hide space-x-4 px-2">
              {offers.map((offer) => (
                <div
                  key={offer._id}
                  className="flex-shrink-0 w-72 bg-white rounded-xl shadow hover:shadow-md transition"
                >

              {/* Card image */}
              <div className="relative w-full h-72 rounded-t-xl overflow-hidden group">
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Card content */}
                <div className="absolute bottom-0 p-4 w-full z-10">
                  <h3 className="text-white text-lg font-semibold truncate drop-shadow">{offer.title}</h3>
                  <p className="text-white text-sm line-clamp-2 drop-shadow-sm mt-1">{offer.description}</p>
                  <span className="inline-block mt-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                    {offer.discountValue}
                    {offer.discountType === "percentage" ? "%" : "₹"} OFF
                  </span>
                </div>
              </div>

              {/* Shop Now */}
              <div className="p-3">
                <button
                  onClick={() => handleShopNowClick(offer)}
                  className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium text-sm transition"
                >
                  {offer.buttonText || "Shop Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
      ) : (
        /* Centered grid */
        
         <div className="inline-grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer._id}
                className="w-72 bg-white rounded-xl shadow hover:shadow-md transition"
              >
                {/* Card image */}
                <div className="relative w-full h-72 rounded-t-xl overflow-hidden group">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Card content */}
                  <div className="absolute bottom-0 p-4 w-full z-10">
                    <h3 className="text-white text-lg font-semibold truncate drop-shadow">{offer.title}</h3>
                    <p className="text-white text-sm line-clamp-2 drop-shadow-sm mt-1">{offer.description}</p>
                    <span className="inline-block mt-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                      {offer.discountValue}
                      {offer.discountType === "percentage" ? "%" : "₹"} OFF
                    </span>
                  </div>
                </div>

                {/* Shop Now */}
                <div className="p-3">
                  <button
                    onClick={() => handleShopNowClick(offer)}
                    className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium text-sm transition"
                  >
                    {offer.buttonText || "Shop Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        
      )}
      </div>
    </section>
  );
};

export default OfferSection;
