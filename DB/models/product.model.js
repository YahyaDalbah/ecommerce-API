import mongoose, { Schema, Types, model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      default: 1,
    },
    price: {
      type: Number,
      default: 1,
    },
    discount: {
      type: Number,
      default: 0,
    },
    subCategoryId: {
      type: Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brandId: {
      type: Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    colors: [String],
    sizes: {
      type: String,
      enum: ["s", "m", "lg", "xl"],
    },
    mainImage: {
      type: Object,
      
    },
    subImages: {
      type: Object,
    },
    deleted: {
      type: Boolean,
      default: false
    },
    createdBy: { type: Types.ObjectId, ref: "User" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);



const Product = mongoose.models.Product || model("Product", productSchema);
export default Product;
