import { Router } from "express";
import { auth, roles, validate } from "./auth.middleware.js";
import { asyncHandler } from "../services/asyncHandler.js";
import Joi from "joi";
import { validationFields } from "../services/validationFields.js";
import Product from "../DB/models/product.model.js";
import slugify from "slugify";
import SubCategory from "../DB/models/subCategory.model.js";
import Brand from "../DB/models/brand.model.js";
import uploadFile, { HME } from "../services/upload.js";
import cloudinary from "../services/cloudinary.js";
import Category from "../DB/models/category.model.js";

const productRouter = Router();

const createProductSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  discount: Joi.number(),
  stock: Joi.number().required(),
  subCategoryId: validationFields.id.required(),
  categoryId: validationFields.id.required(),
  mainImage: Joi.optional(),
  subImages: Joi.optional()
}).required();
const updateProductSchema = Joi.object({
  name: Joi.string().min(2),
  description: Joi.string(),
  price: Joi.number(),
  discount: Joi.number(),
  stock: Joi.number(),
  subCategoryId: validationFields.id,
  categoryId: validationFields.id,
  productId: validationFields.id.required(),
}).required();

productRouter.post(
  "/",
  auth([roles.admin]),
  uploadFile().fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
  ]),
  HME,
  validate(createProductSchema),
  asyncHandler(async (req, res, next) => {
    const { name, subCategoryId, categoryId } = req.body;
    const slug = slugify(name);
    req.body.slug = slug;
    const subCategory = await SubCategory.findById(subCategoryId);
    const category = await Category.findById(categoryId);
    if (await Product.findOne({ slug })) {
      return next({ err: "duplicate name" });
    }
    if (!subCategory) {
      return next({ err: "subCategory not found" });
    }
    if (!category) {
      return next({ err: "category not found" });
    }
    if(subCategory.categoryId != categoryId){
      return next({ err: "subcategory should be part of category" });
    }
    if (req.files) {
      if (req.files.mainImage) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          req.files.mainImage[0].path,
          { folder: `ecommerce/product` }
        );
        const image = {};
        image.secure_url = secure_url;
        image.public_id = public_id;
        req.body.mainImage = image;
      }
      if (req.files.subImages) {
        req.body.subImages = [];
        for (const file of req.files.subImages) {
          const { secure_url, public_id } = await cloudinary.uploader.upload(
            file.path,
            { folder: `ecommerce/product` }
          );
          const image = {};
          image.secure_url = secure_url;
          image.public_id = public_id;
          req.body.subImages.push(image);
        }
      }
    }
    const product = await Product.create(req.body);
    const categoryName = category.name;
    const subCategoryName = subCategory.name;
    const response = {
      ...product._doc,
      categoryName,
      subCategoryName,
    };
    res.json(response);
  })
);

productRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { page, size } = req.query;
    let filterQuery = { ...req.query };
    const arr = ["page", "size", "sort", "search"];
    arr.forEach((filter) => {
      delete filterQuery[filter];
    });
    filterQuery = JSON.parse(
      JSON.stringify(filterQuery).replace(
        /gt|gte|lt|lte|in|nin|eq|neq/g,
        (match) => `$${match}`
      )
    );
    const skip = (page - 1) * size;
    const products = await Product.find(filterQuery)
      .limit(size)
      .skip(skip)
      .sort(req.query.sort?.replaceAll(",", " "))
      .find({ name: { $regex: req.query.search || "", $options: "i" } });
    return res.json(products);
  })
);
productRouter.put(
  "/:productId",
  auth([roles.admin]),
  uploadFile().fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
  ]),
  HME,
  validate(updateProductSchema),
  asyncHandler(async (req, res, next) => {
    const { productId } = req.params;

    const product = await Product.findByIdAndUpdate(productId, { ...req.body },{new: true});

    if (req.files && req.files.mainImage) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.mainImage[0].path,
        { folder: `ecommerce/product` }
      );
      const image = {};
      image.secure_url = secure_url;
      image.public_id = public_id;
      if (product.mainImage)
        await cloudinary.uploader.destroy(product.mainImage.public_id);
      product.mainImage = image;
    }
    if (req.files && req.files.subImages) {
      const subImages = [];
      for (const file of req.files.subImages) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          { folder: `ecommerce/product` }
        );
        const image = {};
        image.secure_url = secure_url;
        image.public_id = public_id;
        subImages.push(image);
      }
      if (product.subImages)
        for (const file of product.subImages) {
          await cloudinary.uploader.destroy(file.public_id);
        }
      product.subImages = subImages;
    }
    await product.save();
    return res.json(product);
  })
);
productRouter.patch("/softDelete/:productId", (req, res) => {
  //just update the deleted field
});
productRouter.delete(
  "/:productId",
  asyncHandler(async (req, res, next) => {
    const { productId } = req.params;
    const product = await Product.deleteOne({ _id: productId });

    return res.json(
      product.deletedCount > 0 ? "product deleted" : "error deleting"
    );
  })
);
export default productRouter;
