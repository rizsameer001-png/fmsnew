const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

const initCloudinary = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    logger.warn('Cloudinary credentials not provided. File upload will use local storage.');
    return null;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  logger.info('✅ Cloudinary initialized');
  return cloudinary;
};

const uploadToCloudinary = async (fileBuffer, options = {}) => {
  const cloud = initCloudinary();
  if (!cloud) return null;

  return new Promise((resolve, reject) => {
    const uploadStream = cloud.uploader.upload_stream(
      {
        folder: options.folder || 'fms',
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = async (publicId) => {
  const cloud = initCloudinary();
  if (!cloud) return null;

  return cloud.uploader.destroy(publicId);
};

module.exports = { initCloudinary, uploadToCloudinary, deleteFromCloudinary };