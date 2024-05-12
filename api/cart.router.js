import { Router } from "express";
import { auth, roles, validate } from "./auth.middleware.js";
import { asyncHandler } from "../services/asyncHandler.js";
import Joi from "joi";
import { validationFields } from "../services/validationFields.js";
import slugify from "slugify";
import SubCategory from "../DB/models/subCategory.model.js";
import Brand from "../DB/models/brand.model.js";
import uploadFile from "../services/upload.js";
import cloudinary from "../services/cloudinary.js";
import Cart from "../DB/models/cart.model.js";
import Product from "../DB/models/product.model.js";

const cartRouter = Router();

const createCartSchema = Joi.object({
  qty: Joi.number().required(),
  productId: validationFields.id.required(),
}).required();
const updateCartSchema = Joi.object({
  productId: validationFields.id.required(),
  qty: Joi.number().min(0).required(),
}).required();

cartRouter.post(
  "/",
  auth([roles.admin, roles.user]),
  validate(createCartSchema),
  asyncHandler(async (req, res, next) => {
    const { productId, qty } = req.body;
    const userId = req.user.id;
    const product = await Product.findById(productId);
    if (!product) {
      return next({ err: `add to cart: product not found` });
    }
    if (product.stock < qty) {
      return next({ err: `add to cart: product not enough stock` });
    }
    let cart = await Cart.findOne({ userId });
    if (cart) {
      let found = false;
      for (const product of cart.products) {
        if (product.productId == productId) {
          product.qty += qty;
          found = true;
          break;
        }
      }
      if (!found) {
        cart.products.push({ productId, qty });
      }
      await cart.save();
    } else {
      cart = await Cart.create({
        products: [{ productId, qty }],
        userId,
      });
    }
    product.stock -= qty;
    product.save(); //can leave it

    return res.json(cart);
  })
);

cartRouter.put(
  "/",
  auth([roles.admin, roles.user]),
  validate(createCartSchema),
  asyncHandler(async (req, res, next) => {
    const { productId, qty } = req.body;
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId });
    const product = await Product.findById(productId);
    if (!cart) {
      return next({ err: "update cart: no cart" });
    }
    let found = false;
    for (const cartProduct of cart.products) {
      if (cartProduct.productId == productId) {
        if (product.stock < qty - cartProduct.qty) {
          return next({ err: `update cart: product not enough stock` });
        }
        product.stock -= qty - cartProduct.qty;
        if (qty == 0) {
          cart.products = cart.products.filter(
            (product) => product.productId != productId
          );
          found = true;
          break;
        }
        cartProduct.qty = qty;
        found = true;
        break;
      }
    }
    if (!found) {
      return next({ err: "update cart: product not found" });
    }
    await cart.save();
    await product.save();
    return res.json(cart);
  })
);

cartRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId });
    return res.json(cart);
  })
);

export default cartRouter;
