import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
/** 
 controller for add product
 @POST :/api/product/add'
 */
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;
    // Validate image upload
    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: "Please upload product images",
      });
    }
    // Extract uploaded images
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined,
    );
    // Upload images to Cloudinary
    const imageUrls = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });

        return result.secure_url;
      }),
    );
    // Create product object
    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true",
      sizes: JSON.parse(sizes),
      image: imageUrls,
      date: Date.now(),
    };

    // console.log(productData);

    // Save product in database
    const product = new productModel(productData);
    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
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
 controller for list product
 @GET :/api/product/list
 */
export const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
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
 controller for remove product
 @POST :/api/product/remove 
 */
export const removeProduct = async (req, res) => {
  try {
    const product = await productModel.findByIdAndDelete(req.body.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product removed successfully",
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
 controller for remove product
 @PATCH :/api/product/update/:id
 */              
export const updateProduct = async (req, res) => {
  try {
    const { name, category, subCategory, price } = req.body;

    await productModel.findByIdAndUpdate(req.params.id, {
      name,
      category,
      subCategory,
      price,
    });

    return res.status(200).json({
      success: true,
      message: "Product Update successfully",
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
 controller for single product info
@GET  :/api/product/single
 */
export const singleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
