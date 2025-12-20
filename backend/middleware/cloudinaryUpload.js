import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  // No file size limits - only count limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Middleware for uploading logo, images, and service images
export const uploadBusinessMedia = upload.any();

/**
 * Upload file buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, folder, transformation = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          {
            width: transformation.width || 1200,
            height: transformation.height || 800,
            crop: 'limit',
            quality: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Process uploaded files and upload to Cloudinary
 */
export const processCloudinaryUploads = async (req, res, next) => {
  try {
    // Organize files by fieldname
    const filesByField = {};
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        if (!filesByField[file.fieldname]) {
          filesByField[file.fieldname] = [];
        }
        filesByField[file.fieldname].push(file);
      });
    }
    req.files = filesByField;

    // Process logo
    if (req.files?.logo?.[0]) {
      const logoFile = req.files.logo[0];
      const logoResult = await uploadToCloudinary(
        logoFile.buffer,
        'varanasihub/logos',
        { width: 500, height: 500 }
      );
      req.files.logo[0].cloudinary = logoResult;
    }

    // Process gallery images - no limit
    if (req.files?.images && req.files.images.length > 0) {
      const imagePromises = req.files.images.map((image) =>
        uploadToCloudinary(
          image.buffer,
          'varanasihub/gallery',
          { width: 1200, height: 800 }
        )
      );
      const imageResults = await Promise.all(imagePromises);
      
      req.files.images.forEach((image, index) => {
        image.cloudinary = imageResults[index];
      });
    }

    // Process service images (dynamic field names like serviceImage_0, serviceImage_1, etc.)
    const serviceImageFields = Object.keys(req.files).filter(key => key.startsWith('serviceImage_'));
    if (serviceImageFields.length > 0) {
      const serviceImagePromises = serviceImageFields.map(fieldName => {
        const file = req.files[fieldName][0];
        return uploadToCloudinary(
          file.buffer,
          'varanasihub/services',
          { width: 800, height: 600 }
        ).then(result => {
          file.cloudinary = result;
          return { fieldName, result };
        });
      });
      await Promise.all(serviceImagePromises);
    }

    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Failed to upload images to Cloudinary' });
  }
};

// Helper function to extract Cloudinary URL from upload result
export const getCloudinaryUrl = (file) => {
  if (!file || !file.cloudinary) return null;
  return file.cloudinary.secure_url || file.cloudinary.url;
};

export default upload;

