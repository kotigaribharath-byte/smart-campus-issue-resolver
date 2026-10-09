import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

// Ensure uploads folder exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage for local handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images (JPEG, PNG, WEBP, GIF)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  }
  cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter,
});

// Helper function to upload file to Cloudinary if enabled, or return local public URL
export const processUploadedFile = async (req, file) => {
  if (!file) return null;

  if (isCloudinaryConfigured()) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'campusfix',
        resource_type: 'image',
      });
      // Delete temporary local file after successful upload
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        // ignore
      }
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error, using local path:', error);
      // Fallback to local URL
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.protocol || 'http';
      return `${protocol}://${host}/uploads/${file.filename}`;
    }
  }

  // Local storage URL
  const host = req.get('host') || 'localhost:5000';
  const protocol = req.protocol || 'http';
  return `${protocol}://${host}/uploads/${file.filename}`;
};
