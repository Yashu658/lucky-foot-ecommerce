// pages/SearchResults.js
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { FaSearch, FaSadTear } from "react-icons/fa";

const SearchBox = () => {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  useEffect(() => {
    try {
      if (location.state) {
        setResults(location.state.results || []);
        setQuery(location.state.query || "");
        setMessage(location.state.message || "");
      }
    } catch (err) {
      setError("Failed to load search results");
      console.error("SearchBox error:", err);
    }
  }, [location.state]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FaSadTear className="text-5xl text-gray-400 mb-4" />
        <p className="text-xl text-gray-600">{error}</p>
        <Link
          to="/"
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const ProductCard = ({ product }) => {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <Link to={`/product/${product._id}`} className="block">
          <div className="relative pb-[100%]">
            <img
              src={product.image[0]}
              alt={product.name}
              className="absolute h-full w-full object-cover"
            />
          </div>
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-indigo-600">
                  ₹{product.salePrice}
                </span>
                {product.discount > 0 && (
                  <span className="ml-2 text-sm text-gray-500 line-through">
                    ₹{product.mrp}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="ml-1 text-sm text-gray-700">
                  {typeof product.averageRating === "number"
                    ? product.averageRating.toFixed(1)
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Search Results for "{query}"
        </h1>
        <p className="text-gray-600">
          {results.length} {results.length === 1 ? "item" : "items"} found
        </p>
      </div>

      {message ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FaSadTear className="text-5xl text-gray-400 mb-4" />
          <p className="text-xl text-gray-600">{message}</p>
          <Link
            to="/"
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
