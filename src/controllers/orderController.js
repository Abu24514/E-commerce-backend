import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

/* Global variables */
const origin = process.env.FRONTEND_URL;
const currency = "INR";
const deliveryCharge = 10;

/*  --- gateway initialize ---- */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 controller for Placing orders using COD Method
 @POST :/api/order/place
 */
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.userId;

    // order create karo
    await orderModel.create({
      userId,
      items,
      amount,
      address,
      status: "Order Placed",
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    });

    // cart clear karo order place hone ke baad
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
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
 controller for Placing orders using Stripe Method
 @POST :/api/order/stripe
 */
const placeOrderStrip = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.userId;

    const newOrder = await orderModel.create({
      userId,
      items,
      amount,
      address,
      status: "Order Placed",
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    });

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charge",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    return res.status(200).json({
      success: true,
      session_url: session.url,
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
controller for verify stripePayment
@POST : /api/order/verifyStripe
  * */
const verifyStripe = async (req, res) => {
  const { orderId, success } = req.body;
  const userId = req.userId;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      // cart clear karo order place hone ke baad
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.status(200).json({
        success :true
      })
    }else{
      await orderModel.findByIdAndDelete(orderId)
      res.status(200).json({ success: false })
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
  controller for Placing orders using Razorpay Method
  @POST :/api/order/razorpay
 */
// const placeOrderRazorpay = async (req, res) => {};

/**
 controller for All Orders -- Admin Panel
 @GET :/api/order/list
 */
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    return res.status(200).json({
      success: true,
      orders,
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
 controller for User Orders -- Frontend
 @POST :/api/order/userorders
 */
const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await orderModel.find({ userId });
    return res.status(200).json({
      success: true,
      orders,
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
 controller for Update Order Status -- Admin Panel
 @POST :/api/order/status
 */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    return res.status(200).json({
      success: true,
      message: "Status updated",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  placeOrder,
  placeOrderStrip,
  verifyStripe,
  // placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
};
