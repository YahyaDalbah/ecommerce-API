import mongoose, { Schema, Types, model } from "mongoose";

const subCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
  },
  image: {
    type: Object,
  },
  categoryId: {
    type: Types.ObjectId,
    ref: "Category",
  },
  createdBy: { type: Types.ObjectId, ref: "User" },
});

const SubCategory = mongoose.models.SubCategory || model("SubCategory", subCategorySchema);
export default SubCategory;
