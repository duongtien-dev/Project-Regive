const { body } = require('express-validator');
const InventoryTransaction = require('../models/InventoryTransaction');
const Product = require('../models/Product');
const { INVENTORY_TX_TYPE } = require('../constants/enums');
const { success, asyncHandler } = require('../utils/api');
const { applyStockChange } = require('../services/inventoryService');

const stockValidators = [
  body('productId').isMongoId(),
  body('quantity').isInt({ min: 1 }),
  body('storageLocation').optional().isString(),
  body('reason').optional().isString(),
];

const adjustValidators = [
  body('productId').isMongoId(),
  body('newQuantity').isInt({ min: 0 }),
  body('storageLocation').optional().isString(),
  body('reason').optional().isString(),
];

const stockIn = asyncHandler(async (req, res) => {
  const result = await applyStockChange({
    productId: req.body.productId,
    type: INVENTORY_TX_TYPE.IN,
    quantity: req.body.quantity,
    userId: req.user._id,
    reason: req.body.reason || 'Stock in',
    storageLocation: req.body.storageLocation,
    referenceType: 'manual',
  });
  return success(res, result, 'Stock in recorded', 201);
});

const stockOut = asyncHandler(async (req, res) => {
  const result = await applyStockChange({
    productId: req.body.productId,
    type: INVENTORY_TX_TYPE.OUT,
    quantity: req.body.quantity,
    userId: req.user._id,
    reason: req.body.reason || 'Stock out',
    storageLocation: req.body.storageLocation,
    referenceType: req.body.referenceType || 'manual',
    referenceId: req.body.referenceId || null,
  });
  return success(res, result, 'Stock out recorded', 201);
});

const adjust = asyncHandler(async (req, res) => {
  const result = await applyStockChange({
    productId: req.body.productId,
    type: INVENTORY_TX_TYPE.ADJUST,
    newQuantity: req.body.newQuantity,
    userId: req.user._id,
    reason: req.body.reason || 'Stock adjust',
    storageLocation: req.body.storageLocation,
    referenceType: 'manual',
  });
  return success(res, result, 'Stock adjusted', 201);
});

const listTransactions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.productId) filter.product = req.query.productId;
  if (req.query.type) filter.type = req.query.type;

  const transactions = await InventoryTransaction.find(filter)
    .populate('product', 'name stockQuantity storageLocation status')
    .populate('createdBy', 'fullName email role')
    .sort({ createdAt: -1 })
    .limit(200);

  return success(res, { transactions });
});

const inventorySummary = asyncHandler(async (_req, res) => {
  const products = await Product.find({ stockQuantity: { $gt: 0 } })
    .select('name category stockQuantity storageLocation status listedOnMarketplace price')
    .sort({ name: 1 });

  const totalSku = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);

  return success(res, { totalSku, totalUnits, products });
});

module.exports = {
  stockValidators,
  adjustValidators,
  stockIn,
  stockOut,
  adjust,
  listTransactions,
  inventorySummary,
};
