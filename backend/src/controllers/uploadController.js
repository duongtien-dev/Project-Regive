const cloudinary = require('cloudinary').v2;
const config = require('../config');
const { success, asyncHandler, ApiError } = require('../utils/api');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary?.cloudName || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: config.cloudinary?.apiKey || process.env.CLOUDINARY_API_KEY,
  api_secret: config.cloudinary?.apiSecret || process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Vui lòng chọn file ảnh để upload');
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'regive',
    resource_type: 'image',
    transformation: [
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  return success(res, {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    size: result.bytes,
  }, 'Upload ảnh thành công');
});

const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'Vui lòng chọn ít nhất một file ảnh');
  }

  const uploadPromises = req.files.map((file) =>
    cloudinary.uploader.upload(file.path, {
      folder: 'regive',
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
      ],
    })
  );

  const results = await Promise.all(uploadPromises);

  const files = results.map((result) => ({
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    size: result.bytes,
  }));

  return success(res, { files }, `Upload ${files.length} ảnh thành công`);
});

const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;

  if (!publicId) {
    throw new ApiError(400, 'Vui lòng cung cấp publicId của ảnh');
  }

  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== 'ok') {
    throw new ApiError(500, 'Không thể xoá ảnh từ Cloudinary');
  }

  return success(res, null, 'Xoá ảnh thành công');
});

module.exports = { uploadImage, uploadMultipleImages, deleteImage };