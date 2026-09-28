const mongoose = require('mongoose');
const { INVENTORY_TX_TYPE } = require('../constants/enums');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: {
      type: String,
      enum: Object.values(INVENTORY_TX_TYPE),
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    previousStock: { type: Number, required: true, min: 0 },
    newStock: { type: Number, required: true, min: 0 },
    storageLocation: { type: String, default: '', trim: true },
    reason: { type: String, default: '', trim: true },
    referenceType: {
      type: String,
      enum: ['donation', 'order', 'support', 'manual', 'other'],
      default: 'manual',
    },
    referenceId: { type: String, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

inventoryTransactionSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
