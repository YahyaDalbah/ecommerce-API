import { Router } from "express";
import { auth, roles, validate } from "./auth.middleware.js";
import uploadFile from "../services/upload.js";
import slugify from "slugify";
import { verify } from "../services/verify.js";
import Category from "../DB/models/category.model.js";
import { asyncHandler } from "../services/asyncHandler.js";
import Joi from "joi";
import cloudinary from "../services/cloudinary.js";
import subCategoryRouter from "./subCategory.router.js";
import { validationFields } from "../services/validationFields.js";
const categoryRouter = Router();



const createCategorySchema = Joi.object({
  name: Joi.string().min(2).required(),
}).required();
const updateCategorySchema = Joi.object({
  categoryId: validationFields.id,
  name: Joi.string().min(2).required(),
}).required();
const getCategorySchema = Joi.object({
  categoryId: validationFields.id,
}).required();

categoryRouter.use('/:categoryId/subCategory',subCategoryRouter)


categoryRouter.post(
  "/",
  auth([roles.admin]),
  uploadFile().single("image"),
  validate(createCategorySchema),
  asyncHandler(async (req, res, next) => {
    const { name } = req.body;
    const slug = slugify(name);
    const image = {};
    //in createdBy, do same for other models, you can add `updatedBy` also
    const category = await Category.create({
      name,
      slug,
      createdBy: req.user.id,
    });
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: `ecommerce/category` },
        
      );
      image.secure_url = secure_url;
      image.public_id = public_id;
    }
    category.image = image;
    await category.save();
    return res.json(category);
    
  })
);
categoryRouter.put(
  "/:categoryId",
  auth([roles.admin]),
  uploadFile().single("image"),
  validate(updateCategorySchema),
  asyncHandler(async (req, res, next) => {
    const { name } = req.body;
    const { categoryId } = req.params;
    const image = {};
    const slug = slugify(name);
    const category = await Category.findById(categoryId);
    if (!category) {
      return next({
        cause: 400,
        err: "update category failed: category not found",
      });
    }
    if (category.name.toLowerCase() == name.toLowerCase()) {
      return next({
        cause: 400,
        err: "update category failed: duplicate name",
      });
    }
    category.name = name
    category.slug = slug
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: `ecommerce/category` },
        
      );
      await cloudinary.uploader.destroy(category.image.public_id);
      image.secure_url = secure_url;
      image.public_id = public_id;
      category.image = image
    }
    
    await category.save()
    return res.json(category);
  })
);
categoryRouter.get(
  "/:categoryId",
  validate(getCategorySchema),
  asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.categoryId)

    return res.json(category)
  })
);
categoryRouter.get(
  "/",
  asyncHandler(async (req, res, next) => {
    const categories = await Category.find().populate({path: 'subCategories', select: 'name'});

    return res.json(categories);
  })
);
categoryRouter.delete("/:categoryId",asyncHandler(async (req,res,next) => {
  const {categoryId} = req.params
  const category = await Category.deleteOne({_id: categoryId})
  
  return res.json(category.deletedCount > 0 ? "category deleted" : "error deleting")
}))
export default categoryRouter;
