const {
  UNSAFE_CONDITIONS,
} = require('../constants/enums');

function canListProduct(product) {
  if (!product.reviewed) return { ok: false, reason: 'Product must be reviewed before listing' };
  if (!product.suitableForMarketplace) {
    return { ok: false, reason: 'Product is marked unsuitable for marketplace' };
  }
  if (UNSAFE_CONDITIONS.includes(product.condition)) {
    return { ok: false, reason: 'Damaged/unsafe products cannot be listed' };
  }
  if (product.stockQuantity < 1) {
    return { ok: false, reason: 'Product has no stock' };
  }
  if (!product.price || product.price <= 0) {
    return { ok: false, reason: 'Product price must be set' };
  }
  return { ok: true };
}

module.exports = { canListProduct };
