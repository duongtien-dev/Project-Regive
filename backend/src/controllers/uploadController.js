const path = require('path');
const fs = require('fs');
const config = require('../config');
const { success, asyncHandler, ApiError } = require('../utils/api');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Vui lòng chọn file ảnh để upload');
  }

  const fileUrl = `${config.frontendUrl.replace(':3000', ':5000')}/uploads/${req.file.filename}`;

  return success(res, {
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  }, 'Upload ảnh thành công');
});

const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'Vui lòng chọn ít nhất một file ảnh');
  }

  const baseUrl = config.frontendUrl.replace(':3000', ':5000');
  const files = req.files.map((file) => ({
    url: `${baseUrl}/uploads/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
  }));

  return success(res, { files }, `Upload ${files.length} ảnh thành công`);
});

const deleteImage = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, '../../uploads', filename);

  if (!fs.existsSync(filePath)) {
    throw new ApiError(404, 'Không tìm thấy file');
  }

  fs.unlinkSync(filePath);
  return success(res, null, 'Xoá ảnh thành công');
});

module.exports = { uploadImage, uploadMultipleImages, deleteImage };