const { body, param } = require('express-validator');
const Product = require('../models/Product');
const Donation = require('../models/Donation');
const {
  ROLES,
  DONATION_TYPES,
  DONATION_STATUS,
  PRODUCT_STATUS,
  PRODUCT_CONDITION,
  PRODUCT_QUALITY,
  UNSAFE_CONDITIONS,
} = require('../constants/enums');
const { ApiError, success, asyncHandler } = require('../utils/api');
const { canListProduct } = require('../services/productRules');

const intakeValidators = [
  body('donationId').isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('description').optional().isString(),
  body('category').optional().isString(),
  body('images').optional().isArray(),
];

const assessValidators = [
  param('id').isMongoId(),
  body('category').optional().trim().notEmpty(),
  body('condition').isIn(Object.values(PRODUCT_CONDITION)),
  body('quality').isIn(Object.values(PRODUCT_QUALITY)),
  body('suggestedPrice').optional().isFloat({ min: 0 }),
  body('price').optional().isFloat({ min: 0 }),
  body('suitableForMarketplace').optional().isBoolean(),
  body('assessmentNote').optional().isString(),
  body('description').optional().isString(),
];

const idParam = [param('id').isMongoId()];

const intakeFromDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.body.donationId);
  if (!donation) throw new ApiError(404, 'Donation not found');
  if (donation.type !== DONATION_TYPES.PRODUCT) {
    throw new ApiError(400, 'Only product donations can be converted to products');
  }
  if ([DONATION_STATUS.REJECTED].includes(donation.status)) {
    throw new ApiError(400, 'Rejected donation cannot be intake');
  }

  const existing = await Product.findOne({ donation: donation._id });
  if (existing) {
    throw new ApiError(409, 'Product already created from this donation', {
      productId: existing._id,
    });
  }

  const product = await Product.create({
    name: req.body.name || donation.productInfo?.name || 'Donated product',
    description: req.body.description || donation.productInfo?.description || '',
    category: req.body.category || 'other',
    images: req.body.images || [],
    donation: donation._id,
    campaign: donation.campaign,
    stockQuantity: 0,
    createdBy: req.user._id,
    status: PRODUCT_STATUS.DRAFT,
  });

  if (donation.status === DONATION_STATUS.PENDING) {
    donation.status = DONATION_STATUS.PROCESSING;
    donation.processedBy = req.user._id;
    donation.processedAt = new Date();
    await donation.save();
  }

  return success(res, { product }, 'Product intake created', 201);
});

const assess = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  product.condition = req.body.condition;
  product.quality = req.body.quality;
  if (req.body.category !== undefined) product.category = req.body.category;
  if (req.body.description !== undefined) product.description = req.body.description;
  if (req.body.suggestedPrice !== undefined) product.suggestedPrice = req.body.suggestedPrice;
  if (req.body.price !== undefined) {
    product.price = req.body.price;
  } else if (req.body.suggestedPrice !== undefined && !product.price) {
    product.price = req.body.suggestedPrice;
  }
  if (req.body.assessmentNote !== undefined) product.assessmentNote = req.body.assessmentNote;

  const suitable =
    req.body.suitableForMarketplace !== undefined
      ? Boolean(req.body.suitableForMarketplace)
      : !UNSAFE_CONDITIONS.includes(product.condition) &&
        product.condition !== PRODUCT_CONDITION.POOR;

  if (UNSAFE_CONDITIONS.includes(product.condition)) {
    product.suitableForMarketplace = false;
    product.status = PRODUCT_STATUS.REJECTED;
  } else {
    product.suitableForMarketplace = suitable;
    product.status = PRODUCT_STATUS.ASSESSED;
  }

  product.reviewed = true;
  product.reviewedBy = req.user._id;
  product.reviewedAt = new Date();
  await product.save();

  return success(res, { product }, 'Product assessed');
});

const listManage = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.reviewed !== undefined) filter.reviewed = req.query.reviewed === 'true';

  const products = await Product.find(filter)
    .populate('donation', 'type status productInfo')
    .populate('campaign', 'title')
    .populate('createdBy', 'fullName email')
    .populate('reviewedBy', 'fullName email')
    .sort({ createdAt: -1 });

  return success(res, { products });
});

const getById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('donation', 'type status productInfo donor')
    .populate('campaign', 'title status')
    .populate('createdBy', 'fullName email')
    .populate('reviewedBy', 'fullName email');

  if (!product) throw new ApiError(404, 'Product not found');

  const isStaff = [ROLES.ADMIN, ROLES.EMPLOYEE].includes(req.user?.role);
  if (!product.listedOnMarketplace && !isStaff) {
    throw new ApiError(404, 'Product not found');
  }

  return success(res, { product });
});

const listMarketplace = asyncHandler(async (req, res) => {
  const filter = {
    listedOnMarketplace: true,
    status: PRODUCT_STATUS.LISTED,
    stockQuantity: { $gt: 0 },
  };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.condition) filter.condition = req.query.condition;

  const products = await Product.find(filter)
    .select('-assessmentNote')
    .sort({ listedAt: -1 });

  return success(res, { products });
});

const getMarketplaceDetail = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    listedOnMarketplace: true,
    status: PRODUCT_STATUS.LISTED,
  }).select('-assessmentNote');

  if (!product) throw new ApiError(404, 'Marketplace product not found');
  return success(res, { product });
});

const publish = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const check = canListProduct(product);
  if (!check.ok) throw new ApiError(400, check.reason);

  product.listedOnMarketplace = true;
  product.listedAt = new Date();
  product.status = PRODUCT_STATUS.LISTED;
  await product.save();

  return success(res, { product }, 'Product listed on marketplace');
});

const unpublish = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  product.listedOnMarketplace = false;
  product.status =
    product.stockQuantity > 0 ? PRODUCT_STATUS.IN_STOCK : PRODUCT_STATUS.SOLD_OUT;
  await product.save();

  return success(res, { product }, 'Product unpublished');
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const fields = [
    'name',
    'description',
    'category',
    'images',
    'price',
    'suggestedPrice',
    'storageLocation',
    'assessmentNote',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });

  await product.save();
  return success(res, { product }, 'Product updated');
});

module.exports = {
  intakeValidators,
  assessValidators,
  idParam,
  intakeFromDonation,
  assess,
  listManage,
  getById,
  listMarketplace,
  getMarketplaceDetail,
  publish,
  unpublish,
  updateProduct,
};
