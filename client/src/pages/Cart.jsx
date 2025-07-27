import React, { useState, useEffect } from "react";
import {Link, useNavigate } from "react-router-dom";
import Container from "../components/Container";
import { useCart } from "../context/CartContext";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import axios from "../config/api";
import ViewProductMod from "./ViewProductMod";

const Cart = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [modalAction, setModalAction] = useState("view");

  const {
    cart,
    addToCart,
    removeFromCart,
    removeOneFromCart,
    clearCart,
    setCart,
  } = useCart();

  const navigate = useNavigate();

  useEffect(() => {
    const refreshStock = async () => {
      const updatedCart = await Promise.all(
        cart.map(async (item) => {
          const res = await axios.get(
            `/api/admin/product/${item.product._id}`
          );
          return {
            ...item,
            product: res.data.product,
          };
        })
      );
      setCart(updatedCart);
    };

    if (cart.length > 0) {
      refreshStock();
    }
  }, []);

  //const discountedPrice = product.mrp - (product.mrp * product.discount) / 100;
  const handleBuyNow = (item) => {
     if (!item.selectedSize) {
    toast.error(`Please select a size for "${item.product.name}" before proceeding.`);
    return;
  }
    setSelectedProduct(item.product);
    setSelectedSize(item.selectedSize || null);
    setModalAction("buy");
    setIsViewModalOpen(true);
  };

  const handleBuyAll = () => {
    const itemWithoutSize = cart.find((item) => !item.selectedSize);

    if (itemWithoutSize) {
      toast.error(
        `Please select a size for "${itemWithoutSize.product.name}" before proceeding.`
      );
      return;
    }
    navigate("/PlaceOrder", {
      state: {
        products: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          selectedSize: item.selectedSize,
        })),
      },
    });
  };

  const saveCartToBackend = async () => {
    try {
      await axios.post("/api/cart/addCart", {
        products: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          selectedSize: item.selectedSize || null,
        })),
      });
    } catch (err) {
      console.error("Error saving cart:", err);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get("/api/cart/getCart", {
        withCredentials: true,
      });
    // console.log("Fetched Cart:", res.data.products);
      if (res?.data?.products) {
        const cartItems = res.data.products.map((p) => ({
          product: p.productId,
          quantity: p.quantity,
          selectedSize: p.selectedSize || null,
        }));
        setCart(cartItems);
      } else {
        setCart([]);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setCart([]);
      } else {
        console.error("Error loading cart:", err);
      }
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      saveCartToBackend();
    }
  }, [cart]);

  // Calculate total payable and total saved
  const totals = cart.reduce(
    (acc, item) => {
      const price = item.product.mrp;
      const discount = item.product.discount;
      const discountedPrice = price - (price * discount) / 100;

      acc.total += discountedPrice * item.quantity;
      acc.saved += ((price * discount) / 100) * item.quantity;

      return acc;
    },
    { total: 0, saved: 0 }
  );

  const openProductModal = (product) => {
    const foundCartItem = cart.find((item) => item.product._id === product._id);
    setSelectedProduct(product);
    setSelectedSize(foundCartItem?.selectedSize || null);
    setModalAction("view");
    setIsViewModalOpen(true);
  };

  if (!cart || cart.length === 0) {
    return (
      <Container className="py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart is Empty</h1>
      </Container>
    );
  }

  return (
    <Container className="py-8 space-y-6">
      <h1 className="text-3xl font-bold">Your Cart</h1>

      <div className="space-y-4">
        {cart.map(({ product, quantity, selectedSize: cartSize }) => {
          // Find the current stock quantity for the selected size:
          const sizeStock =
            product.size?.find((s) => s.size === cartSize?.size)?.quantity || 0;

          const discountedPrice =
            product.mrp - (product.mrp * product.discount) / 100;

          return (
            <div
              key={product._id + (cartSize?._id || "")}
              // key simplified to prevent duplicates
              className="flex items-center justify-between bg-white rounded-lg shadow-md p-4"
            >
              <div
                onClick={() => openProductModal(product)}
                className="flex items-center cursor-pointer"
              >
                {product?.image?.[0] ? (  <Link
    to={`/product/${product.productId?._id || product._id}`}
    className="w-24 h-24 shrink-0"
    onClick={(e) => e.stopPropagation()} // Prevents triggering modal
  >
    <img
      src={product.image[0]}
      alt={product.name}
      className="w-24 h-24 object-cover rounded"
    />
  </Link>
                ) : (
                  <div className="w-24 h-24 bg-gray-200 flex items-center justify-center rounded">
                    <span className="text-gray-500">No Image</span>
                  </div>
                )}

                <div className="ml-4">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="text-indigo-600 font-bold text-xl">
                    ₹
                    {(
                      (product.mrp - (product.mrp * product.discount) / 100) *
                      quantity
                    ).toLocaleString()}
                    <span className="text-sm text-gray-500 ml-1">
                      ({quantity} pcs)
                    </span>
                  </p>
                  {product.discount > 0 && (
                    <p className="line-through text-red-500 font-bold text-2xl">
                      ₹{product.mrp.toLocaleString()}
                    </p>
                  )}

                  <p className="mt-1">Size: UK {cartSize?.size || "N/A"}</p>
                  <p className="mt-1">Quantity: {quantity}</p>

                  {/* Stock Info */}
                  {cartSize && (
                    <p
                      className={`mt-1 font-semibold ${
                        sizeStock === 0
                          ? "text-red-600"
                          : sizeStock < 5
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {sizeStock === 0
                        ? "Out of Stock"
                        : sizeStock < 5
                        ? `Only ${sizeStock} left in stock`
                        : null}
                    </p>
                  )}

                  {/* Size Selector */}
                  <div className="flex gap-2 mt-2 px-3 py-1">
                    {product.size?.map((sizeObj) => {
                      const isOutOfStock = sizeObj.quantity === 0;
                      return (
                        <button
                         // key={sizeObj._id}
                         key={sizeObj._id || sizeObj.size}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isOutOfStock) {
                              toast.error("Selected size is out of stock.");
                              return;
                            }
                            // Add the product with quantity 1 for the new size
                            addToCart(product, 1, sizeObj); //replace old entry
                          }}
                          className={`px-3 py-1 rounded border ${
                            cartSize?.size === sizeObj.size
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white text-gray-800 border-gray-400"
                          }`}
                         disabled={false}
                          title={
                            isOutOfStock
                              ? "Out of Stock"
                              : `Stock: ${sizeObj.quantity}`
                          }
                        >
                          UK {sizeObj.size}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!cartSize) {
                          toast.error(
                            "Please select a size before increasing quantity."
                          );
                          return;
                        }
                        const cartItem = cart.find(
                          (item) =>
                            item.productId === product._id &&
                            item.size === cartSize
                        );
                        const currentQty = cartItem ? cartItem.quantity : 0;

                        if (currentQty >= 10) {
                          toast.error(
                            "You cannot buy more than 10 products at a time."
                          );
                          return;
                        }

                        if (currentQty >= sizeStock) {
                          toast.error(
                            "Reached maximum stock for selected size."
                          );
                          return;
                        }
                        addToCart(product, 1, cartSize);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    >
                      <FiPlus />
                    </button>
                    <p className="mt-1">{quantity}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOneFromCart(product._id, cartSize?._id || null);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                    >
                      <FiMinus />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleBuyNow({ product, quantity, selectedSize: cartSize });
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  title={sizeStock === 0 ? "Selected size is out of stock" : ""}
                >
                  Buy
                </button>

                <button
                  onClick={() =>
                    removeFromCart(product._id, cartSize?._id || null)
                  }
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center mt-8">
        <div className="text-left text-gray-800">
          <p className="text-lg font-semibold">
            Total: ₹
            <span className="text-blue-600 text-4xl font-bold">
              {totals.total.toLocaleString()}
            </span>
          </p>
          <p className="text-green-600 text-4xl font-bold">
            You Saved: ₹{totals.saved.toLocaleString()}
          </p>
        </div>

        <button
          onClick={handleBuyAll}
          className="bg-green-700 text-white px-6 py-3 rounded hover:bg-green-800 transition"
        >
          Buy All
        </button>
      </div>

      <ViewProductMod
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={selectedProduct}
        action={modalAction}
        selectedSize={selectedSize}
      />
    </Container>
  );
};

export default Cart;
