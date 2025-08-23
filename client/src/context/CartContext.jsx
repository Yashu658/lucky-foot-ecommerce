import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "../config/api";
import { useAuth } from "./authContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const navigate = useNavigate(); 
  const { user, isLogin } = useAuth();
  const [cart, setCart] = useState([]);
  const [isCartLoading, setIsCartLoading] = useState(true);
   const [isSyncing, setIsSyncing] = useState(false);

  // Load cart from backend or sessionStorage
  const fetchCart = async () => {
    try {
      if (isLogin) {
        const res = await axios.get("/api/cart/getCart", {
          withCredentials: true,
        });

      if (res?.data?.products) {
        const cartItems = res.data.products.map((p) => ({
          product: p.productId,
          quantity: p.quantity,
          selectedSize: p.selectedSize || null,
        }));
        setCart(cartItems);
        sessionStorage.setItem("cart", JSON.stringify(cartItems));
      } else {
        setCart([]);
         sessionStorage.removeItem("cart");
      }
    }else {
        const storedCart = sessionStorage.getItem("cart");
        setCart(storedCart ? JSON.parse(storedCart) : []);
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 404) {
        console.log("User not authorized. Likely logged out.");
        setCart([]);
        sessionStorage.removeItem("cart");
      }
      else {
        console.error("Error loading cart:", err);
        toast.error("Failed to load cart. Please refresh.");
      }
    } finally {
      setIsCartLoading(false);
    }
  };

   useEffect(() => {
    fetchCart();
  }, [isLogin]);

  // Synchronize cart with backend and sessionStorage
  const syncCartToBackend = async (newCart) => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      // Update local state first for responsiveness
      setCart(newCart);
      sessionStorage.setItem("cart", JSON.stringify(newCart));

      if (isLogin) {
        await axios.post(
          "/api/cart/addCart",
          {
            products: newCart.map((item) => ({
              productId: item.product._id,
              quantity: item.quantity,
              selectedSize: item.selectedSize || null,
            })),
          },
          { withCredentials: true }
        );
      }
    } catch (err) {
      console.error("Error syncing cart:", err);
      // Revert to previous cart state if sync fails
      const previousCart = JSON.parse(sessionStorage.getItem("cart") || "[]");
      setCart(previousCart);
      toast.error("Failed to update cart. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const addToCart = (
    product,
    quantity = 1,
    selectedSize = null,
    replaceQuantity = false
  ) => {
    if (!user || !user.email || user.email === "") {
      toast.error("Please login to add items to your cart.");
      navigate("/login");
      return;
    }
    if (isCartLoading || isSyncing) {
      toast.error("Please wait...");
      return;
    }

    const productId = product._id;
    const updatedCart = [...cart];

    // Check if the product (any size) is completely new to the cart
    const isFirstTimeAdding = !cart.some(
      (item) => item.product._id === productId
    );

    // Enforce 30 unique product ID limit
    const uniqueProductIds = [...new Set(cart.map((item) => item.product._id))];
    const isNewProductId = !uniqueProductIds.includes(productId);
    if (isNewProductId && uniqueProductIds.length >= 30) {
      toast.error("You cannot add more than 30 unique products to the cart.");
      return;
    }

    const index = updatedCart.findIndex(
      (item) =>
        item.product._id === productId &&
        item.selectedSize?.size === selectedSize?.size // compare by value not _id
    );
    let message = "Product added to cart";
    if (index !== -1) {
      // Product with same size exists, increment quantity
      updatedCart[index] = {
        ...updatedCart[index],
        quantity: replaceQuantity
          ? quantity
          : updatedCart[index].quantity + quantity,
      };
      message = replaceQuantity
        ? "Product already exists in cart"
        : "Product quantity updated";
    } else {
      // Remove other sizes of the same product
      const otherIndex = updatedCart.findIndex(
        (item) => item.product._id === productId
      );

      if (otherIndex !== -1) {
        // Replace with new size
        updatedCart[otherIndex] = {
          product,
           quantity: Math.min(quantity, 10),
          selectedSize,
        };
        message = "Size updated";
      } else {
        if (cart.length >= 30) {
          toast.error("Cart limit reached (30 items max)");
          return;
        }
        // Fully new product
        updatedCart.push({
          product,
           quantity: Math.min(quantity, 10),
          selectedSize,
        });
        message = "added to cart";
      }
    }
    setCart(updatedCart);
    syncCartToBackend(updatedCart);
    toast.success(message);
  };

  const removeFromCart = (
    productId,
    selectedSizeId = null,
    showToast = true
  ) => {
     if (isCartLoading || isSyncing) {
      toast.error("Please wait...");
      return;
    }
    const prevLength = cart.length;

    const updatedCart = cart.filter((item) => {
      const sameProduct = item.product._id === productId;

      if (selectedSizeId === null) {
        // Remove all items of the same product, regardless of size
        return !sameProduct;
        //return false; // remove but createproblem when ordered and refresh show again
      } else {
        const itemSizeId =
          item.selectedSize?._id ||
          item.selectedSize?.size ||
          item.selectedSize ||
          null; 
        const compareId = selectedSizeId;
        return itemSizeId !== selectedSizeId;
      }
    });

    setCart(updatedCart);
    syncCartToBackend(updatedCart);

    if (showToast && updatedCart.length < prevLength) {
      toast.info("Item removed from cart");
    }
  };

  const removeOneFromCart = (productId, selectedSizeId = null) => {
       if (isCartLoading || isSyncing) {
      toast.error("Please wait...");
      return;
    }
    const updatedCart = [...cart];
    const index = updatedCart.findIndex(
      (item) =>
        item.product._id === productId &&
        (item.selectedSize?._id || null) === selectedSizeId
    );

    if (index !== -1) {
      if (updatedCart[index].quantity > 1) {
        updatedCart[index].quantity -= 1;
        setCart(updatedCart);
        syncCartToBackend(updatedCart);
        toast.info("Decreased quantity");
      } else {
        removeFromCart(productId, selectedSizeId);
        return;
      }setCart(updatedCart);
    }
  };

  

  const removeMultipleFromCart = async (productIds) => {
      if (isCartLoading || isSyncing) {
      toast.error("Please wait...");
      return false;
    }
    try {
    const updatedCart = cart.filter(
      item => !productIds.includes(item.product._id)
    );
    setCart(updatedCart);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
   let res = null;
      //Remove from backend
         if (isLogin) {
       res = await axios.post(
        "/api/cart/remove",
        { productIds }, // DELETE body must be passed as `data`
        { withCredentials: true }
      );}
      
     if (res.status === 200|| !isLogin) {
      // Remove items locally from state
      setCart((prevCart) => {
        const updated = prevCart.filter((item) => {
          const id = item.product?._id || item._id;
          return !productIds.includes(id);
        });
        return updated;
      });
      return true;
    }else {
        toast.error("Failed to remove items from cart.");
        return false;
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      toast.error("Something went wrong while removing items.");
      return false;
    }
  };

  const updateCartItem = async (productId, newQuantity, newSize) => {
    const updatedCart = cart.map((item) => {
      if (item.product._id === productId) {
        return {
          ...item,
          quantity: newQuantity !== undefined ? newQuantity : item.quantity,
          selectedSize: newSize !== undefined ? newSize : item.selectedSize,
        };
      }
      return item;
    });

    setCart(updatedCart);
    await syncCartToBackend(updatedCart);
  };

const clearCart = async () => {
    try {
      setCart([]);
      sessionStorage.removeItem("cart");

      if (isLogin) {
        await axios.post("/api/cart/addCart", { products: [] }, { withCredentials: true });
      }
    } catch (err) {
      console.error("Failed to clear cart:", err);
      toast.error("Failed to clear cart. Please try again.");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        removeOneFromCart,
        removeMultipleFromCart,
        updateCartItem,
        clearCart,
        isCartLoading,
          isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
