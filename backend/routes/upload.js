const express = require("express");
const router = express.Router();
const uploadUserProfile = require("../upload/uploadUserProfile");
const storage = require("../lib/storage");

// JWT-based admin middleware
const adminJwt = require("../middlewares/adminJwt");

// POST /upload/product - Upload product image
router.post("/product", adminJwt, (req, res) => {
  // Use multer middleware with proper error handling
  const upload = uploadUserProfile.single("image");

  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({
        success: false,
        message: "File upload error: " + err.message,
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        });
      }

      const key = storage.buildUploadKey(req.file.originalname);
      const uploaded = await storage.putObject(
        key,
        req.file.buffer,
        req.file.mimetype,
      );

      console.log("File uploaded successfully:", uploaded.key);

      res.json({
        success: true,
        imagePath: `/${uploaded.key}`,
        url: uploaded.url,
        message: "Image uploaded successfully",
        file: {
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      console.error("Upload processing error:", error);
      res.status(500).json({
        success: false,
        message: "Upload processing failed: " + error.message,
      });
    }
  });
});

module.exports = router;
