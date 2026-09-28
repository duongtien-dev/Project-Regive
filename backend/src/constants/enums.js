const ROLES = Object.freeze({
  USER: 'USER',
  BENEFICIARY: 'BENEFICIARY',
  EMPLOYEE: 'EMPLOYEE',
  ADMIN: 'ADMIN',
});

const CAMPAIGN_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
});

const DONATION_TYPES = Object.freeze({
  MONEY: 'money',
  PRODUCT: 'product',
});

const DONATION_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
});

const VOLUNTEER_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
});

const SUPPORT_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
});

const PRODUCT_STATUS = Object.freeze({
  DRAFT: 'draft',
  ASSESSED: 'assessed',
  IN_STOCK: 'in_stock',
  LISTED: 'listed',
  SOLD_OUT: 'sold_out',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
});

const PRODUCT_CONDITION = Object.freeze({
  NEW: 'new',
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  DAMAGED: 'damaged',
});

const PRODUCT_QUALITY = Object.freeze({
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
});

const INVENTORY_TX_TYPE = Object.freeze({
  IN: 'in',
  OUT: 'out',
  ADJUST: 'adjust',
});

const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

const PAYMENT_PURPOSE = Object.freeze({
  ORDER: 'order',
  DONATION: 'donation',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
});

const UNSAFE_CONDITIONS = Object.freeze([PRODUCT_CONDITION.DAMAGED]);

const AI_ASSESSMENT_STATUS = Object.freeze({
  SUGGESTED: 'suggested',
  CONFIRMED: 'confirmed',
  OVERRIDDEN: 'overridden',
  REJECTED: 'rejected',
  FAILED: 'failed',
});

module.exports = {
  ROLES,
  CAMPAIGN_STATUS,
  DONATION_TYPES,
  DONATION_STATUS,
  VOLUNTEER_STATUS,
  SUPPORT_STATUS,
  PRODUCT_STATUS,
  PRODUCT_CONDITION,
  PRODUCT_QUALITY,
  INVENTORY_TX_TYPE,
  ORDER_STATUS,
  PAYMENT_PURPOSE,
  PAYMENT_STATUS,
  UNSAFE_CONDITIONS,
  AI_ASSESSMENT_STATUS,
};
