import { Router } from "express";
import { auth, roles, validate } from "./auth.middleware.js";
import Brand from "../DB/models/brand.model.js";
import { asyncHandler } from "../services/asyncHandler.js";
import Joi from "joi";
import { validationFields } from "../services/validationFields.js";
import Category from "../DB/models/category.model.js";

const brandRouter = Router();

const createBrandSchema = Joi.object({
  name: Joi.string().min(2).required(),
  categoryId: validationFields.id,
}).required();
const updateBrandSchema = Joi.object({
  brandId: validationFields.id,
  name: Joi.string().min(2),
  categoryId: validationFields.id,
}).required();

brandRouter.post(
  "/",
  auth([roles.admin]),
  validate(createBrandSchema),
  asyncHandler(async (req, res, next) => {
    const { name, categoryId } = req.body;
    const category = await Category.findById(categoryId);
    if (!category) {
      return next({ err: "category not found" });
    }
    const brand = await Brand.create({ name, categoryId });
    res.json(brand);
  })
);
brandRouter.get(
  "/:brandId",
  asyncHandler(async (req, res,next) => {
    const { brandId } = req.params;
    const brand = await Brand.findById(brandId);
    if (!brand) {
      return next({ err: "brand not found" });
    }
    return res.json(brand);
  })
);
brandRouter.get(
  "/all/:categoryId",
  asyncHandler(async (req, res,next) => {
    const {categoryId} = req.params
    const category = await Category.findById(categoryId);
    if (!category) {
      return next({ err: "category not found" });
    }
    const brands = await Brand.find({ categoryId });
    return res.json(brands);
  })
);
brandRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const brands = await Brand.find();
    return res.json(brands);
  })
);
brandRouter.put(
  "/:brandId",
  auth([roles.admin]),
  validate(updateBrandSchema),
  asyncHandler(async (req, res, next) => {
    const { name, categoryId } = req.body;
    const { brandId } = req.params;

    const brand = await Brand.findById(brandId);
    const category = await Category.findById(categoryId);
    if (!category) {
      return next({ err: "category not found" });
    }
    if (!brand) {
      return next({ err: "brand not found" });
    }
    if (name == brand.name && categoryId == brand.categoryId) {
      return next({
        err: "update brand error: name & category duplicated",
      });
    }
    if (name) brand.name = name;
    if (categoryId) brand.categoryId = categoryId;
    await brand.save();
    return res.json(brand);
  })
);

export default brandRouter;
