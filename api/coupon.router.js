import { Router } from "express";
import { validate } from "./auth.middleware.js";
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
}).required();
couponRouter.post(
  "/",
  validate(createCouponSchema),
  asyncHandler(async (req, res,next) => {
    const { name, amount, expireDate } = req.body;
    let date = new Date(expireDate)
    const now = new Date()
    if(now.getTime() > date.getTime()){
      return next({err: "create coupon: date must be bigger than now"})
    }
    
    let day = date.getDate();
    let month = date.getMonth() + 1; // Month starts from 0, so add 1
    let year = date.getFullYear();

    // Format the date as YYYY-MM-DD
    date =
      year +
      "-" +
      month.toString().padStart(2, "0") +
      "-" +
      day.toString().padStart(2, "0");

    const coupon = await Coupon.create({ name, amount,expireDate: date }); //still doesn't change format in mongoDB

    res.json(coupon);
  })
);
couponRouter.get("/:couponId", async (req, res) => {
  const { couponId } = req.params;
  const coupon = await Coupon.findById(couponId);
  return res.json(coupon);
});
couponRouter.get("/", async (req, res) => {
  const coupons = await Coupon.find();
  return res.json(coupons);
});
couponRouter.put(
  "/:couponId",
  validate(updateCouponSchema),
  async (req, res, next) => {
    const { name, amount, expireDate } = req.body;
    const { couponId } = req.params;
    if (!name && !amount) {
      return next({ err: "update coupon error: name or amount should exist" });
    }
    const coupon = await Coupon.findById(couponId);
    if (name == coupon.name) {
      return next({
        err: "update coupon error: name duplicated",
      });
    }
    if (name) coupon.name = name;
    if (amount) coupon.amount = amount;
    await coupon.save();
    return res.json(coupon);
  }
);

export default couponRouter;
