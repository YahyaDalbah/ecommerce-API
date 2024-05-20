import { Router } from "express";
import { auth, roles } from "./auth.middleware.js";
import User from "../DB/models/user.model.js";
import { asyncHandler } from "../services/asyncHandler.js";

const userRouter = Router();

userRouter.get(
  "/",
  auth([roles.admin, roles.user]),
  asyncHandler(async (req, res,next) => {
    const user = await User.findById(req.user.id);
    if(!user){
      return next({err: "user not found",cause:404})
    }
    res.json(user);
  })
);
export default userRouter;
