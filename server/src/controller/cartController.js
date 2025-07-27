import Cart from "../models/cartModel.js";

// Save or Update Cart
export const addCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { products } = req.body;

    if (!products) {
      return res.status(400).json({ error: "Missing products" });
    }

    const formattedProducts = products.map(p => ({
      productId: p.productId,
      quantity: p.quantity,
     selectedSize: p.selectedSize || "N/A", 
    }));

    let cart = await Cart.findOne({ userId });

    if (cart) {
      await Cart.findOneAndUpdate(
        { _id: cart._id },
        { products: formattedProducts, updatedAt: new Date() },
        { new: true }
      );
      return res.status(200).json({ message: "Cart updated" });
    }

    cart = new Cart({ userId, products: formattedProducts });
    await cart.save();
    res.status(201).json({ message: "Cart created" });
  } catch (err) {
    console.error("Cart save error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;  
    let cart = await Cart.findOne({ userId })
    .populate("products.productId");
    if (!cart) {
      cart = await Cart.create({ userId, products: [] });
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart", error: err.message });
  }
};

export const removeProductFromCart = async (req, res) => {
  const userId = req.user._id; // from auth
  const { productId } = req.params;

  try {
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { products: { productId } } },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart or product not found." });
    }

    res.status(200).json({ message: "Product removed from cart.", cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


export const removed=async (req, res) => {
  const { productIds } = req.body;
  const userId = req.user.id;
   console.log("Removing product IDs:", productIds);
  console.log("User ID:", userId);

  try {
    await Cart.updateOne(
       { userId },
      { $pull: { products: { productId: { $in: productIds } } } }
    );

    res.status(200).json({ message: "Products removed from cart." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error removing cart items." });
  }
}