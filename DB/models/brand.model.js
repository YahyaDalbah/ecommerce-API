import mongoose, { Schema, Types, model } from "mongoose";

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: Object,
    },
    categoryId: {
      type: Types.ObjectId,
      ref: "Category",
    },
    createdBy: { type: Types.ObjectId, ref: "User" },
  }
);

const Brand = mongoose.models.Brand || model("Brand", brandSchema);
export default Brand;
