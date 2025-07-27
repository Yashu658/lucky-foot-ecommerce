import User from "../models/userModel.js"

export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json(user.addresses);
  } catch (err) {
    res.status(500).json({ error: "Failed to add address" });
  }
};


export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
      if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
     res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const addressId = req.params.id;
    const index = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (index === -1) {
      return res.status(404).json({ error: "Address not found" });
    }

    user.addresses.splice(index, 1);
    await user.save();

    res.json({ message: "Address deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete address" });
  }
};



export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const addressId = req.params.id;
    const address = user.addresses.id(addressId); 

    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    // Update fields (only those sent)
    Object.assign(address, req.body);

    await user.save();
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: "Failed to update address" });
  }
};
