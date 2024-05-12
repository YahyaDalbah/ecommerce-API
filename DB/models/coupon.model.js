import mongoose, { Schema, Types, model } from "mongoose";

const couponSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    expireDate: {
      type: Date,
    },
    usedBy: [{type: Types.ObjectId, ref:'User'}],
    createdBy: {type: Types.ObjectId, ref:'User'}
  }
);

const Coupon = mongoose.models.Coupon || model("Coupon", couponSchema);
export default Coupon;
