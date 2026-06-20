import jwt from "jsonwebtoken";
/**
controller for admin login
@POST : /api/admin/login
*/
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      return res.status(200).json({
        success: true,
        token, 
        message: "Admin login successfully",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/** 
 controller for user login
 @POST : /api/admin/logout
 */
export const adminLogout = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Admin logout successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/** 
 controller for user login
 @GET : /api/admin/check-auth
 */
export const checkAdminAuth = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
