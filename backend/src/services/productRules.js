const {
  UNSAFE_CONDITIONS,
} = require('../constants/enums');

function canListProduct(product) {
  if (!product.reviewed) return { ok: false, reason: 'Sản phẩm phải được đánh giá trước khi đăng bán' };
  if (!product.suitableForMarketplace) {
    return { ok: false, reason: 'Sản phẩm được đánh dấu là không phù hợp với marketplace' };
  }
  if (UNSAFE_CONDITIONS.includes(product.condition)) {
    return { ok: false, reason: 'Sản phẩm hư hỏng hoặc không an toàn không thể đăng bán' };
  }
  if (product.stockQuantity < 1) {
    return { ok: false, reason: 'Sản phẩm không còn tồn kho' };
  }
  if (!product.price || product.price <= 0) {
    return { ok: false, reason: 'Vui lòng thiết lập giá sản phẩm' };
  }
  return { ok: true };
}

module.exports = { canListProduct };
