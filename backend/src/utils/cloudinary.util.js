/**
 * @file cloudinary.util.js
 * @module utilities/cloudinaryUtility
 * @description Utility module for handling Cloudinary image uploads and deletions with robust validation, error handling, and optimized streaming for production environments.
 */

const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { Readable } = require("stream"); // Native Node.js stream API
const AppError = require("../errors/app-error");

// Absolute Validation of Environment Variables
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("CRITICAL: Missing required Cloudinary configuration credentials.");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** * Allowed MIME types exclusively for images
 
 */
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

/**
 * Multer file filter architecture validating image MIME-types dynamically
 */
const fileFilter = (req, file, cb) => {
  if (!file) {
    return cb(new AppError("No file payload provided.", 400), false);
  }

  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new AppError("Invalid file extension format. Supported formats: JPG, JPEG, PNG, WEBP.", 400),
    false
  );
};

/**
 * Production Multer Instance for Images
 * Limits image buffers to a maximum of 10MB per file payload.
 */
exports.upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB absolute cap per image
}).fields([
  { name: "profilePicture", maxCount: 1 },
]);

/**
 * Maps incoming image definitions to isolated remote cloud storage directories
 
 
 */
const getFolderForUploadType = (type) => {
  const base = "WHITE_BEAR";
  switch (type) {
    case "profilePicture":
      return `${base}/profilePictures`;
    
    default:
      throw new AppError(`Unsupported application upload category target: ${type}`, 400);
  }
};

/**
 * Production-Grade Stream Upload Function
 * Pipes raw binary image data directly to Cloudinary's servers through non-blocking I/O chunks.
 */
exports.uploadToCloudinary = async (file, type, existingPublicId = null) => {
  if (!file || !file.buffer) {
    throw new AppError("File buffer stream missing from payload execution block.", 400);
  }

  const folder = getFolderForUploadType(type);

  let targetPublicId = existingPublicId;
  if (!targetPublicId) {
    const timestamp = Date.now();
    const randomSeed = crypto.randomBytes(4).readUInt32BE(0);
    
    // ❌ OLD BROKEN WAY:
    // targetPublicId = `${folder}/${timestamp}-${randomSeed}.${cleanExtension}`;
    
    //  NEW PRODUCTION WAY (No extensions in the public ID string)
    targetPublicId = `${folder}/${timestamp}-${randomSeed}`;
  }

  return new Promise((resolve, reject) => {
    const cloudinaryUploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: targetPublicId,
        resource_type: "image",
        overwrite: true,
        invalidate: true,
      },
      (error, result) => {
        if (error) {
          console.error("💥 Cloudinary Image Streaming Exception:", error);
          return reject(new AppError("Failed to route image streams to Cloudinary.", 502));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    );

    Readable.from(file.buffer).pipe(cloudinaryUploadStream);
  });
};

/**
 * Delete an image asset from Cloudinary securely using its remote web address pointer
 * Handles URLs with embedded transformation parameters and custom namespaces seamlessly.
 */
exports.deleteFromCloudinary = async (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== "string") return;

  try {
    // 1. Split the URL at Cloudinary's core action path
    const urlParts = fileUrl.split("/upload/");
    if (urlParts.length < 2) {
      console.warn(`⚠️ Skipping deletion: Invalid URL structure [${fileUrl}]`);
      return;
    }

    // 2. Remove the version tag (e.g., v1780570780/) if present
    let publicId = urlParts[1].replace(/^v\d+\//, '');

    // 3. Drop any extensions by cutting the string at the very first dot
    const firstDotIndex = publicId.indexOf('.');
    if (firstDotIndex !== -1) {
      publicId = publicId.substring(0, firstDotIndex);
    }

    // 4. Trigger the absolute deletion context
    const deletionResponse = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });

    if (deletionResponse.result !== "ok" && deletionResponse.result !== "not_found") {
      throw new Error(`Cloudinary unexpected status signature: ${deletionResponse.result}`);
    }

    console.log(`✅ Cleaned remote image resource: [${publicId}]`);
  } catch (err) {
    console.error("💥 Cloudinary Asset Purge Pipeline Interruption:", err.message);
  }
};