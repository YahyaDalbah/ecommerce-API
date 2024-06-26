import { Router } from "express";
import { auth, roles, validate } from "./auth.middleware.js";
import { asyncHandler } from "../services/asyncHandler.js";
import Joi from "joi";
import { validationFields } from "../services/validationFields.js";
import Cart from "../DB/models/cart.model.js";
import Product from "../DB/models/product.model.js";
import createInvoice from "../services/createInvoice.js";

const cartRouter = Router();

const createCartSchema = Joi.object({
  qty: Joi.number().min(1).required(),
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
      return next({ err: `product not found` });
    }
    if (product.stock < qty) {
      return next({ err: `product not enough stock` });
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
        cart.products.push({
          productId,
          qty,
          name: product.name,
          price: product.price,
        });
      }
      await cart.save();
    } else {
      cart = await Cart.create({
        products: [
          { productId, qty, name: product.name, price: product.price },
        ],
        userId,
      });
    }
    product.stock -= qty;

    await product.save();

    return res.json(cart);
  })
);

cartRouter.put(
  "/",
  auth([roles.user]),
  validate(updateCartSchema),
  asyncHandler(async (req, res, next) => {
    const { productId, qty } = req.body;
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId });
    const product = await Product.findById(productId);
    if (!cart) {
      return next({ err: "no cart" });
    }
    if (!product) {
      return next({ err: "no product" });
    }
    let found = false;
    for (const cartProduct of cart.products) {
      if (cartProduct.productId == productId) {
        if (product.stock < qty - cartProduct.qty) {
          return next({ err: `product not enough stock` });
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
      return next({ err: "product not found" });
    }
    await cart.save();
    await product.save();
    return res.json(cart);
  })
);

cartRouter.get(
  "/",
  auth([roles.user]),
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    let cart = await Cart.findOne({ userId });
    return res.json(cart);
  })
);

cartRouter.post(
  "/checkout",
  auth([roles.user, roles.admin]),
  asyncHandler(async (req, res, next) => {
    const { address, city, country, state } = req.body;
    const { user } = req;
    let cart = await Cart.findOne({ userId: user.id }).populate({
      path: "products",
      populate: { path: "productId", select: `name description price` },
    });
    if (!cart) {
      return next({ err: "no cart" });
    }
    if (cart.products.length == 0) {
      return next({ err: "no products" });
    }
    let subtotal = 0;
    const items = cart.products.map((product) => {
      subtotal += product.qty * product.productId.price;
      return {
        item: product.productId.name,
        description: product.productId.description,
        amount: product.qty * product.productId.price,
        quantity: product.qty,
      };
    });
    const invoice = {
      shipping: {
        name: user.userName,
        address,
        city,
        state,
        country,
        postal_code: 94111,
      },

      items,
      subtotal,
      paid: subtotal,
      invoice_nr: cart._id,
    };
    createInvoice(invoice, "invoice.pdf");
    cart.products = [];
    await cart.save();
    return res.json("checkout completed");
  })
);

export default cartRouter;
