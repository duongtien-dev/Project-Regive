const mongoose = require('mongoose');
const { ORDER_STATUS } = require('../constants/enums');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'VND' },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },
    shippingAddress: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    note: { type: String, default: '' },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    statusHistory: [
      {
        status: { type: String },
        at: { type: Date, default: Date.now },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        note: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);
