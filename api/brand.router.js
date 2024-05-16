import { Router } from "express";
import { validate } from "./auth.middleware.js";
import Brand from "../DB/models/brand.model.js";
import { asyncHandler } from "../services/asyncHandler.js";
import Joi from "joi";
import { validationFields } from "../services/validationFields.js";

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
  validate(createBrandSchema),
  asyncHandler(async (req, res) => {
    const { name, categoryId } = req.body;

    const brand = await Brand.create({ name, categoryId });
    if (req.file) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        { folder: `ecommerce/brand` },
        
      );
      brand.image.secure_url = secure_url;
      brand.image.public_id = public_id;
      await brand.save();
    }
    res.json(brand);
  })
);
brandRouter.get(
  "/:brandId",
  asyncHandler(async (req, res) => {
    const { brandId } = req.params;
    const brand = await Brand.findById(brandId);
    return res.json(brand);
  })
);
brandRouter.get(
  "/all/:categoryId",
  asyncHandler(async (req, res) => {
    const brands = await Brand.find({ categoryId: req.params.categoryId });
    return res.json(brands);
  })
);
brandRouter.put(
  "/:brandId",
  validate(updateBrandSchema),
  asyncHandler(async (req, res, next) => {
    const { name, categoryId } = req.body;
    const { brandId } = req.params;

    const brand = await Brand.findById(brandId);
    if (name == brand.name) {
      return next({
        err: "update brand error: name duplicated",
      });
    }
    if (name) brand.name = name;
    if (categoryId) brand.categoryId = categoryId;
    await brand.save();
    return res.json(brand);
  })
);

export default brandRouter;
