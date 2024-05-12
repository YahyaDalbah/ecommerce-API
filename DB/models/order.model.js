import mongoose, { Schema, Types, model } from "mongoose";

const orderSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  address: {
    type: String,
    required: true
  },
  couponId:{
    type:Types.ObjectId,
    ref: 'Coupon'
  },
  products: [
    {
      productId: { type: Types.ObjectId, ref: "Product" },
      qty: { type: Number, default: 1 },
      price: {type:Number, default: 100}
    },
  ],
  status:{
    type: String,
    default: 'pending',
    enum: ['pending','canceled','approved','onWay','delivered']
  }
});

const Order = mongoose.models.Order || model("Order", orderSchema);
export default Order;
