import mongoose, { Schema, Types, model } from "mongoose";
import SubCategory from "./subCategory.model.js";
import Product from "./product.model.js";

const categorySchema = new Schema(
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
    image: {
      type: Object,
    },
    createdBy: { type: Types.ObjectId, ref: "User" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// When you `populate()` the `subCategories` virtual, Mongoose will find the
// first document in the subCategory model whose `categoryId` matches this document's
// `_id` property.
categorySchema.virtual("subCategories", {
  localField: "_id",
  foreignField: "categoryId",
  ref: "SubCategory",
});
categorySchema.pre(
  "deleteOne",
  { document: false, query: true },
  async function () {
    const { _id } = this.getFilter();
    const doc = await this.model.findById(_id);
    if (doc) {
      await SubCategory.deleteMany({ categoryId: doc._id });
      await Product.deleteMany({ categoryId: doc._id });
    }
  }
);
const Category = mongoose.models.Category || model("Category", categorySchema);
export default Category;
