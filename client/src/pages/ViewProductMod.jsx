import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiPlus, FiMinus } from "react-icons/fi";


const ViewProductMod = (props) => {
  const { isOpen, product } = props;

  // ✅ Early escape BEFORE render (safe)
  if (!isOpen || !product) return <></>; // <- Or null, both fine

  return <ViewProductModContent {...props} />;
};





const ViewProductModContent = ({
  isOpen,
  onClose,
  product,
  action, 
  selectedSize: initialSize,
   filteredSizes = [],
}) => {
 // if (!isOpen || !product) return null;

  const { user } = useAuth();
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();

  // Debugging: Log product data when modal opens
  // useEffect(() => {
  //   if (isOpen) {
  //     console.log("Product in modal:", product);
  //     console.log("Size data:", product.size);
  //     console.log("Type of size:", typeof product.size);
  //   }
  // }, [isOpen, product]);

  // Safely handle sizes data
  const sizes = (() => {
    if (!product?.size) return [];
    if (Array.isArray(product.size)) {
      return product.size.filter(
        (item) =>
          item &&
          typeof item === "object" &&
          "size" in item &&
          "quantity" in item
      );
    }
    return [];
  })();

  const images = product?.image
    ? Array.isArray(product.image)
      ? product.image
      : []
    : [];

useEffect(() => {
  if (!product || selectedSize) return;

  let defaultSize = null;

  // If it's a Buy Now action and we have filtered sizes, use first in-stock filtered size
  if (action === "buyNow" && filteredSizes.length > 0) {
    const availableSizes = sizes.filter(
      (size) =>
        filteredSizes.includes(size.size?.toString()) && size.quantity > 0
    );
    if (availableSizes.length > 0) {
      defaultSize = availableSizes[0];
    }
  }

  // If an initial size is provided and matched
  if (!defaultSize && initialSize) {
    const matchedSize = sizes.find(
      (s) =>
        s._id?.toString() === initialSize._id?.toString() ||
        s.size?.toString() === initialSize.size?.toString()
    );
    if (matchedSize) {
      defaultSize = matchedSize;
    }
  }

  // Fallback if only one size available
  if (!defaultSize && sizes.length === 1) {
    defaultSize = sizes[0];
  }

  // Apply selected size & quantity if a default was found
  if (defaultSize) {
    setSelectedSize(defaultSize);

    // Look in cart for quantity if not buyNow
    if (action !== "buyNow") {
      const cartItem = cart.find(
        (item) =>
          item.product._id === product._id &&
          (item.selectedSize?._id?.toString() ||
            item.selectedSize?.size?.toString()) ===
            (defaultSize._id?.toString() || defaultSize.size?.toString())
      );
      setQuantity(cartItem?.quantity || 1);
    } else {
      setQuantity(1);
    }
  }
}, [product, action, initialSize, filteredSizes, sizes, cart, selectedSize]);

  const discountedPrice = product.mrp - (product.mrp * product.discount) / 100;

 const handleSizeSelect = (sizeObj) => {
  console.log("Selected size object:", sizeObj);
  setSelectedSize(sizeObj);
   setQuantity(1);
};

  const handleAddToCart = () => {
    if (!selectedSize) return toast.error("Please select a size.");
    addToCart(product, quantity, selectedSize, true);
    onClose();
  };

  const handleBuyNow = () => {
    if (!user?.email) {
      toast.error("Please login to continue.");
      navigate("/login");
      return;
    }

    if (!selectedSize) return toast.error("Please select a size.");
    if (selectedSize.quantity === 0)
      return toast.error("Selected size is out of stock.");

    if (quantity > 10) {
      toast.error("You cannot buy more than 10 products at a time.");
      return;
    }

    navigate("/PlaceOrder", {
      state: {
        product: { ...product, selectedSize },
        selectedSize,
        quantity,
      },
    });
    onClose();
  };
  // useEffect(() => {
  //   console.log("Product data:", product);
  //   console.log("Sizes array:", sizes);
  // }, [product]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl p-6 mt-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-800 hover:text-red-600"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {images.length > 0 ? (
                images.map((img) => (
                  <img
                    key={img}
                    src={img}
                    alt={`${product.name}`}
                    className="w-full h-44 object-cover rounded-lg"
                  />
                ))
              ) : (
                <div className="col-span-2 flex items-center justify-center h-44 bg-gray-100 rounded-lg">
                  <p>No images available</p>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{product.name}</p>
              <p className="text-lg text-gray-700">{product.brand}</p>
              <p className="text-sm text-gray-500 capitalize">
                {product.category} / {product.subCategory}
              </p>
              <p className="text-sm text-gray-500">Color: {product.color}</p>
              <p className="text-sm text-yellow-600 font-semibold">
  Rating: {product.averageRating ? product.averageRating.toFixed(1) : "0.0"}/5
</p>

            </div>

            {/* Size Selector */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Select Size (Required)
              </h3>
              {/* Replace the current size selector grid with this: */}
              <div className="grid grid-cols-4 gap-2">
                {sizes.length > 0 ? (
                  sizes.map((item, index) => (
                    <button
                    key={`${item._id || item.size || index}`}
                    //key={item._id || `size-${item.size}`}

                       onClick={(e) => {
    e.stopPropagation();
    if (item.quantity === 0) {
      toast.error("This size is currently out of stock.");
      return;
    }
    handleSizeSelect(item);
  }}
                      className={`border rounded-lg p-2 font-bold text-gray-900 transition
         ${
      selectedSize &&
      (
        (item._id && selectedSize._id?.toString() === item._id?.toString()) ||
        selectedSize.size?.toString() === item.size?.toString()
      )
        ? "bg-green-500 text-white border-green-600"
        : "bg-white hover:bg-gray-100 border-gray-300"
    }
  `}
        
                      title={item.quantity === 0 ? "Out of Stock" : ""}
                      // disabled={item.quantity === 0}
                    >
                      UK {item.size}
                    </button>
                  ))
                ) : (
                  <p className="col-span-4 text-gray-500">No sizes available</p>
                )}
              </div>

              {/* Stock Info */}
              {selectedSize && (
                <div>
                  <p
                    className={`mt-2 font-bold text-xl ${
                      selectedSize.quantity === 0
                        ? "text-red-600"
                        : "text-red-400"
                    }`}
                  >
                    {selectedSize.quantity === 0
                      ? "Out of Stock"
                      : selectedSize.quantity < 5
                      ? `Only ${selectedSize.quantity} left in stock`
                      : null}
                  </p>
                  {quantity > selectedSize.quantity && (
                    <p className="text-red-600 font-bold text-3xl">
                      You selected {quantity}, but only {selectedSize.quantity}{" "}
                      in stock.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 border-t pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-indigo-600 font-bold text-xl">
              ₹{(discountedPrice * quantity).toLocaleString()}{" "}
              <span className="text-sm text-gray-500 ml-1">
                ({quantity} pcs)
              </span>
            </p>
            {product.discount > 0 && (
              <p className="line-through text-red-500 font-bold text-2xl">
                ₹{product.mrp.toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Quantity Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                <FiMinus />
              </button>
              <span className="font-semibold">{quantity}</span>
              <button
                onClick={() => {
                  if (!selectedSize)
                    return toast.error("Please select a size.");
                  if (quantity >= 10) {
                    toast.error("Maximum 10 items allowed");
                    return;
                  }
                  if (quantity >= selectedSize.quantity) {
                    toast.error(`Only ${selectedSize.quantity} available`);
                    return;
                  }
                  setQuantity(quantity + 1);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                <FiPlus />
              </button>
            </div>

            {/* Action Buttons */}
            <button
              onClick={handleAddToCart}
              className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={selectedSize && quantity > selectedSize.quantity}
              className={`px-5 py-2 rounded-full font-medium transition
                ${
                  selectedSize && quantity > selectedSize.quantity
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }
              `}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductMod;
