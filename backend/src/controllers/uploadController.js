import { processUploadedFile } from '../middleware/upload.js';

// @desc    Upload an image (Cloudinary or local storage fallback)
// @route   POST /api/upload
// @access  Private
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file.',
      });
    }

    const imageUrl = await processUploadedFile(req, req.file);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully.',
      imageUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private
export const uploadMultipleImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image file.',
      });
    }

    const uploadPromises = req.files.map((file) => processUploadedFile(req, file));
    const imageUrls = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully.',
      imageUrls,
    });
  } catch (error) {
    next(error);
  }
};
