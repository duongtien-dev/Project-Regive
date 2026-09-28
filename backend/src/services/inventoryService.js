const Product = require('../models/Product');
const InventoryTransaction = require('../models/InventoryTransaction');
const { INVENTORY_TX_TYPE, PRODUCT_STATUS } = require('../constants/enums');
const { ApiError } = require('../utils/api');

async function applyStockChange({
  productId,
  type,
  quantity,
  newQuantity,
  userId,
  reason = '',
  storageLocation,
  referenceType = 'manual',
  referenceId = null,
}) {
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const previousStock = product.stockQuantity;
  let newStock = previousStock;
  let txQuantity = 0;

  if (type === INVENTORY_TX_TYPE.IN) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      throw new ApiError(400, 'quantity must be a positive integer');
    }
    newStock = previousStock + qty;
    txQuantity = qty;
  } else if (type === INVENTORY_TX_TYPE.OUT) {
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      throw new ApiError(400, 'quantity must be a positive integer');
    }
    if (previousStock < qty) {
      throw new ApiError(400, 'Insufficient stock');
    }
    newStock = previousStock - qty;
    txQuantity = qty;
  } else if (type === INVENTORY_TX_TYPE.ADJUST) {
    const target = Number(newQuantity);
    if (!Number.isInteger(target) || target < 0) {
      throw new ApiError(400, 'newQuantity must be an integer >= 0');
    }
    newStock = target;
    txQuantity = Math.abs(newStock - previousStock) || 0;
  } else {
    throw new ApiError(400, 'Invalid inventory transaction type');
  }

  product.stockQuantity = newStock;
  if (storageLocation !== undefined && storageLocation !== null && storageLocation !== '') {
    product.storageLocation = storageLocation;
  }

  if (type === INVENTORY_TX_TYPE.IN && product.status === PRODUCT_STATUS.ASSESSED) {
    product.status = PRODUCT_STATUS.IN_STOCK;
  }
  if (newStock === 0 && product.listedOnMarketplace) {
    product.status = PRODUCT_STATUS.SOLD_OUT;
    product.listedOnMarketplace = false;
  }
  if (newStock > 0 && product.status === PRODUCT_STATUS.SOLD_OUT) {
    product.status = PRODUCT_STATUS.IN_STOCK;
  }

  await product.save();

  const transaction = await InventoryTransaction.create({
    product: product._id,
    type,
    quantity: txQuantity || 1,
    previousStock,
    newStock,
    storageLocation: product.storageLocation,
    reason,
    referenceType,
    referenceId,
    createdBy: userId,
  });

  return { product, transaction };
}

module.exports = { applyStockChange };
