import mongoose from 'mongoose'

// ─────────────────────────────────────────────────────────────────────────────
// Canonical order status pipeline — must match frontend ORDER_STAGES in adminData.js
// ─────────────────────────────────────────────────────────────────────────────
export const ORDER_STATUSES = [
  'Pending Approval',   // 0 — order placed, awaiting admin review
  'Approved',           // 1 — admin accepted the order
  'Preparing',          // 2 — kitchen started preparation
  'Baking',             // 3 — currently baking / assembling
  'Packed',             // 4 — packed and ready for dispatch
  'Out for Delivery',   // 5 — delivery partner picked up
  'Delivered',          // 6 — delivered to customer
  'Cancelled',          // 7 — order cancelled (by user or admin)
  'Rejected',           // 8 — admin rejected the order
  'Refunded',           // 9 — refund processed
];

const paymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    orderItems: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        price: Number,
        quantity: Number,
        subtotal: Number,
        image: String,
        category: String,
        description: String,
      },
    ],
    subtotal: { type: Number, default: 0 },
    delivery_fee: { type: Number, default: 0 },
    final_amount: { type: Number, default: 0 },
    payment_method: { type: String, default: 'Razorpay' },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    payStatus: { type: String },

    // ── Order status pipeline ──────────────────────────────────────────────
    order_status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'Pending Approval',
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'Pending Approval',
    },

    // ── Address & contact ──────────────────────────────────────────────────
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
      full: String,
    },
    phone_number: String,
    notes: String,
    delivery_slot: String,
    cancellationReason: String,
    adminNotes: [{ note: String, actor: String, createdAt: { type: Date, default: Date.now } }],

    // ── Status timestamps ──────────────────────────────────────────────────
    approved_at: Date,
    prepared_at: Date,
    baking_at: Date,
    packed_at: Date,
    dispatched_at: Date,
    delivered_at: Date,
    cancelled_at: Date,
    rejected_at: Date,

    // ── ETA system ────────────────────────────────────────────────────────
    estimated_delivery: Date,         // absolute timestamp
    eta_minutes: { type: Number, default: 60 }, // minutes from order placement
    preparation_type: {
      type: String,
      enum: ['standard', 'custom', 'bulk'],
      default: 'standard',
    },

    // ── Razorpay fields ───────────────────────────────────────────────────
    razorpay_order_id: String,
    paymentId: String,
    signature: String,

    // ── Shipping info ─────────────────────────────────────────────────────
    userShipping: {
      name: String,
      email: String,
      phone: String,
      address: String,
    },

    // ── Timeline log ──────────────────────────────────────────────────────
    timeline: [
      {
        label: String,
        note: String,
        status: String,
        actor: { type: String, default: 'system' }, // 'admin' | 'user' | 'system'
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // ── Notification log ──────────────────────────────────────────────────
    // NOTE: field is named 'kind' (not 'type') because 'type' is a reserved
    // Mongoose schema keyword — using it causes the array to be treated as [String].
    notification_history: [
      {
        kind: String, // 'status_change' | 'admin_note' | 'cancellation'
        message: String,
        sentAt: { type: Date, default: Date.now },
        channel: { type: String, default: 'in-app' }, // 'in-app' | 'email' | 'sms'
      },
    ],

    // ── Refund ────────────────────────────────────────────────────────────
    refund: {
      status: String,
      amount: Number,
      reason: String,
      processedAt: Date,
    },
  },
  { strict: false, timestamps: true }
);

// Index for fast user order queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ order_status: 1, createdAt: -1 });

export const Payment = mongoose.model('Payment', paymentSchema);
