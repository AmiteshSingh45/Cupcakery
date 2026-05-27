import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
    orderDate:{type:Date,default:Date.now},
    payStatus:{type:String},
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Packed",
        "Shipped",
        "Out for delivery",
        "Delivered",
        "Cancelled",
        "Returned",
        "Refunded",
      ],
      default: "Processing",
    },
    timeline: [{ label: String, note: String, createdAt: { type: Date, default: Date.now } }],
    adminNotes: [{ note: String, actor: String, createdAt: { type: Date, default: Date.now } }],
    refund: { status: String, amount: Number, reason: String, processedAt: Date },
},{strict:false})

export const Payment = mongoose.model('Payment',paymentSchema);
