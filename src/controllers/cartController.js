import userModel from "../models/userModel.js";

/** 
 controller for add product to user cart
 @POST : /api/cart/add
 */
export const addToCart = async (req, res) => {
  try {
    const { itemId, size } = req.body;
    const userId = req.userId; // userAuth middleware se aayega

    const user = await userModel.findById(userId);
    let cartData = user.cartData;


    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    return res.status(200).json({
      success: true,
      message: "Added to cart",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/** 
 controller for update user cart quantity
 @PATCH : /api/cart/update
 */
export const updateCart = async (req, res) => {
  try {
    const { itemId, size, quantity } = req.body;
    const userId = req.userId;

    const user = await userModel.findById(userId);
    let cartData = user.cartData;

    if (quantity === 0) {
      delete cartData[itemId][size];
    } else {
      cartData[itemId][size] = quantity;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** 
 controller for get user cart
 @GET : /api/cart/get
 */
export const getUserCart = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await userModel.findById(userId);

    return res.status(200).json({
      success: true,
      cartData: user.cartData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};