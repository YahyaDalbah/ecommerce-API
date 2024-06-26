import { Router } from 'express';
import Joi from 'joi';
import { validationFields } from '../services/validationFields.js';
import uploadFile from '../services/upload.js';
import { auth, roles, validate } from './auth.middleware.js';
import { asyncHandler } from '../services/asyncHandler.js';
import cloudinary from '../services/cloudinary.js';
import slugify from 'slugify';
import SubCategory from "../DB/models/subCategory.model.js";
import Category from "../DB/models/category.model.js";
const subCategoryRouter = Router({mergeParams:true})


const createSubCategorySchema = Joi.object({
  name: Joi.string().min(2).required(),
  categoryId: validationFields.id,
}).required();
const updateSubCategorySchema = Joi.object({
  categoryId: validationFields.id,
  subCategoryId: validationFields.id,
  name: Joi.string().min(2).required(),
}).required();
subCategoryRouter.post(
  "/",
  auth([roles.admin]),
  uploadFile().single("image"),
  validate(createSubCategorySchema),
  asyncHandler(async (req, res, next) => {
    const {categoryId} = req.params
    const category = await Category.findById(categoryId)
    if(!category){
      return next({err: "category not found"})
    }
    const { name } = req.body;
    const slug = slugify(name);
    const image = {};
    const subCategory = await SubCategory.create({ name, slug, categoryId });
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: `ecommerce/category` },
        
      );
      image.secure_url = secure_url;
      image.public_id = public_id;
    }
    subCategory.image = image;
    await subCategory.save();
    return res.json(subCategory);
  })
);

subCategoryRouter.put(
  "/:subCategoryId",
  auth([roles.admin]),
  uploadFile().single("image"),
  validate(updateSubCategorySchema),
  asyncHandler(async (req, res, next) => {
    const { name } = req.body;
    const { categoryId,subCategoryId } = req.params;
    const image = {};
    const slug = slugify(name);
    const subCategory = await SubCategory.findById(subCategoryId);
    if (!subCategory) {
      return next({
        cause: 400,
        err: "subCategory not found",
      });
    }
    if (subCategory.name == name) {
      return next({
        cause: 400,
        err: "duplicate name",
      });
    }
    subCategory.name = name;
    subCategory.slug = slug;

    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: `ecommerce/subCategory` },
        
      );
      if (subCategory.image)
        await cloudinary.uploader.destroy(subCategory.image.public_id);
      image.secure_url = secure_url;
      image.public_id = public_id;
      subCategory.image = image;
    }
    await subCategory.save();
    return res.json(subCategory);
  })
);

subCategoryRouter.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const subCategories = await SubCategory.find({categoryId: req.params.categoryId}).populate({
      path: 'categoryId',
      select: '-_id name'
    });

    return res.json(subCategories);
  })
);
subCategoryRouter.delete(
  "/:subCategoryId",
  asyncHandler(async (req, res, next) => {
    const { subCategoryId } = req.params;
    const subCategory = await SubCategory.deleteOne({ _id: subCategoryId });

    return res.json(
      subCategory.deletedCount > 0 ? "subCategory deleted" : "error deleting"
    );
  })
);

export default subCategoryRouter
