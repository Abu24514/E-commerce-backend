import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

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
// const placeOrderStrip = async (req, res) => {};

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
    // placeOrderStrip,
    // placeOrderRazorpay,
    allOrders,
    userOrders,
    updateStatus,
};