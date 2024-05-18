import mongoose, { Schema, Types, model } from "mongoose";

const formatDate = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
};

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
      required:true,
      get: formatDate
    },
    createdBy: {type: Types.ObjectId, ref:'User'}
  }
);
couponSchema.set("toJSON", { getters: true }); //only changes the response and not the actual data stored

const Coupon = mongoose.models.Coupon || model("Coupon", couponSchema);
export default Coupon;
