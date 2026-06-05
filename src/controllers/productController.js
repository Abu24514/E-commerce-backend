import { v2 as cloudinary } from "cloudinary";
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

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined,
    );
    let imageUrls = await Promise.all(
      images.map(async (item)=>{
        let result = await cloudinary.uploader.upload(item.path, {resource_type:'image'});
        return result.secure_url
      })
    )

    console.log(
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    );
    console.log(imageUrls);
    res.json({});
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

/** 
 controller for list product
 @GET :/api/product/list
 */
export const listProducts = async (req, res) => {};
/** 
 controller for remove product
 @POST :/api/product/remove 
 */
export const removeProduct = async (req, res) => {};

/** 
 controller for single product info
 @POST :/api/product/single
 */
export const singleProduct = async (req, res) => {};
