import mongoose, { Schema, Types, model } from "mongoose";

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

const Category = mongoose.models.Category || model("Category", categorySchema);
export default Category;
