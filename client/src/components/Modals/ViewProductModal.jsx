import { IoMdClose } from "react-icons/io";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";

const ViewProductModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;
// Helper function to handle legacy description format
const getDescription = () => {
  if (!product.description) {
    return {
      overview: '',
      features: [],
      specifications: [],
      materialComposition: '',
      careInstructions: '',
      additionalInfo: ''
    };
  }

  if (typeof product.description === 'string') {
    return {
      overview: product.description,
      features: [],
      specifications: [],
      materialComposition: '',
      careInstructions: '',
      additionalInfo: ''
    };
  }

  return product.description;
};


  const description = getDescription?.() ?? {};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-100 rounded-xl p-6 mt-18 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
          <button onClick={onClose} className="text-gray-800 hover:text-red-600">
            <IoMdClose size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Images</h3>
            <div className="grid grid-cols-2 gap-2">
              {product.image.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} - ${index + 1}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800">Basic Info</h3>
              <p className="text-lg font-bold text-gray-900">{product.name}</p>
              <p className="text-gray-700">{product.brand}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-gray-700">
              <div>
                <span className="text-sm">Price</span>
                <p className="font-semibold">₹{product.mrp}</p>
              </div>
              <div>
                <span className="text-sm">Discount</span>
                <p className="font-semibold">{product.discount}%</p>
              </div>
              <div>
                <span className="text-sm">Category</span>
                <p className="font-semibold capitalize">{product.category}</p>
              </div>
              <div>
                <span className="text-sm">Sub Category</span>
                <p className="font-semibold capitalize">{product.subCategory}</p>
              </div>
              <div>
                <span className="text-sm">Color</span>
                <p className="font-semibold capitalize">{product.color}</p>
              </div>
             
              {/* Added Gender Field */}
              <div>
                <span className="text-sm">Gender</span>
                <p className="font-semibold capitalize">{product.gender || 'unisex'}</p>
              </div>
              {/* Added Status Field */}
              <div>
                <span className="text-sm">Status</span>
                <p className={`font-semibold capitalize ${
                  product.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.status}
                </p>
              </div>
            </div>

            {/* Size & Stock Section */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Size & Stock</h3>
              <div className="grid grid-cols-4 gap-2">
                {product.size.map((item) => (
                  <div
                    key={item._id}
                    className="border border-gray-700 rounded-lg p-2 text-center"
                  >
                    <p className="font-bold text-gray-900">UK {item.size}</p>
                    <p className="text-sm text-gray-700">Stock: {item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

           {/* Product Description */}
            <div className="border-t pt-4">
              <h3 className="text-xl font-semibold mb-4">Product Details</h3>
              
              {description.overview && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-2">Overview</h4>
                  <p className="text-gray-700 whitespace-pre-line">{description.overview}</p>
                </div>
              )}

              {description.features && description.features.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-2">Key Features</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {description.features.map((feature, index) => (
                      <li key={index} className="text-gray-700">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {description.specifications && description.specifications.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-2">Specifications</h4>
                  <div className="space-y-2">
                    {description.specifications.map((spec, index) => (
                      <div key={index} className="grid grid-cols-3 gap-2">
                        <span className="col-span-1 text-gray-600">{spec.name}</span>
                        <span className="col-span-2 text-gray-800">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {description.materialComposition && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-2">Material & Composition</h4>
                  <p className="text-gray-700 whitespace-pre-line">{description.materialComposition}</p>
                </div>
              )}

              {description.careInstructions && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-800 mb-2">Care Instructions</h4>
                  <p className="text-gray-700 whitespace-pre-line">{description.careInstructions}</p>
                </div>
              )}

              {description.additionalInfo && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Additional Information</h4>
                  <p className="text-gray-700 whitespace-pre-line">{description.additionalInfo}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;