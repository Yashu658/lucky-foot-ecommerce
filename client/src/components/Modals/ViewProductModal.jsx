import { IoMdClose } from "react-icons/io";

const ViewProductModal = ({ isOpen, onClose, product }) => {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-secondary flex items-center justify-center z-50">
      <div className="bg-surface-50 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-secondary-content">
            Product Details
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-content hover:text-error"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Images Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-secondary-content">Images</h3>
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
              <h3 className="font-semibold text-secondary-content">Basic Info</h3>
              <p className="text-lg font-bold text-secondary-content">
                {product.name}
              </p>
              <p className="text-secondary-content">{product.brand}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-sm text-secondary-content">Price</span>
                <p className="font-semibold text-secondary-content">
                  ₹{product.mrp}
                </p>
              </div>
              <div>
                <span className="text-sm text-secondary-content">Discount</span>
                <p className="font-semibold text-secondary-content">
                  {product.discount}%
                </p>
              </div>
              <div>
                <span className="text-sm text-secondary-content">Category</span>
                <p className="font-semibold text-secondary-content">
                  {product.category}
                </p>
              </div>
              <div>
                <span className="text-sm text-secondary-content">
                  Sub Category
                </span>
                <p className="font-semibold text-secondary-content">
                  {product.subCategory}
                </p>
              </div>
              <div>
                <span className="text-sm text-secondary-content">Color</span>
                <p className="font-semibold text-secondary-content">
                  {product.color}
                </p>
              </div>
              <div>
                <span className="text-sm text-secondary-content">Rating</span>
                <p className="font-semibold text-secondary-content">
                  {product.rating}/5
                </p>
              </div>
            </div>

            {/* Size & Stock Section */}
            <div>
              <h3 className="font-semibold text-secondary-content mb-2">
                Size & Stock
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {product.size.map((item) => (
                  <div
                    key={item._id}
                    className="border border-secondary-content rounded-lg p-2 text-center"
                  >
                    <p className="font-bold text-secondary-content">
                      UK {item.size}
                    </p>
                    <p className="text-sm text-secondary-content">
                      Stock: {item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-secondary-content">
                Description
              </h3>
              <p className="text-secondary-content">{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;