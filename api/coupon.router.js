import { Router } from "express";
import { auth, roles, validate } from "./auth.middleware.js";
import Coupon from "../DB/models/coupon.model.js";
import { asyncHandler } from "../services/asyncHandler.js";
import Joi from "joi";
import { validationFields } from "../services/validationFields.js";
const couponRouter = Router();

const createCouponSchema = Joi.object({
  name: Joi.string().min(2).required(),
  amount: Joi.number().min(1).required(),
  expireDate: Joi.date(),
}).required();
const updateCouponSchema = Joi.object({
  couponId: validationFields.id,
  name: Joi.string().min(2),
  amount: Joi.number().min(1),
  expireDate: Joi.date(),
}).required();
couponRouter.post(
  "/",
  auth([roles.admin]),
  validate(createCouponSchema),
  asyncHandler(async (req, res, next) => {
    const { name, amount, expireDate } = req.body;
    let date = new Date(expireDate);
    const now = new Date();
    if (now.getTime() > date.getTime()) {
      return next({ err: "create coupon: date must be bigger than now" });
    }

    const coupon = await Coupon.create({ name, amount, expireDate: date,createdBy: req.user.id }); //still doesn't change format in mongoDB

    res.json(coupon);
  })
);
couponRouter.get(
  "/:couponId",
  asyncHandler(async (req, res,next) => {
    const { couponId } = req.params;
    const coupon = await Coupon.findById(couponId);
    if(!coupon){
      return next({err: "no coupon"})
    }
    return res.json(coupon);
  })
);
couponRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const coupons = await Coupon.find();
    return res.json(coupons);
  })
);
couponRouter.put(
  "/:couponId",
  auth([roles.admin]),
  validate(updateCouponSchema),
  asyncHandler(async (req, res, next) => {
    const { name, amount, expireDate } = req.body;
    const { couponId } = req.params;
    if (!name && !amount && !expireDate) {
      return next({
        err: "update coupon error: name or amount or expireDate should exist ",
      });
    }
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return next({ err: "update coupon error: coupon not found" });
    }
    if (name) coupon.name = name;
    if (amount) coupon.amount = amount;
    if (expireDate) coupon.expireDate = expireDate;
    await coupon.save();
    return res.json(coupon);
  })
);

export default couponRouter;
