import mongoose, { Schema, Types, model } from "mongoose";
import Product from "./product.model.js";

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

subCategorySchema.pre(
  "deleteOne",
  { document: false, query: true },
  async function () {
    const { _id } = this.getFilter();
    const doc = await this.model.findById(_id);
    if (doc) {
      await Product.deleteMany({ subCategoryId: doc._id });
    }
  }
);
const SubCategory = mongoose.models.SubCategory || model("SubCategory", subCategorySchema);
export default SubCategory;
