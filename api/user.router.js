import { Router } from "express";
import { auth } from "./auth.middleware.js";

const userRouter = Router();

userRouter.get("/profile", auth, (req, res) => {
  res.json(req.user);
});
export default userRouter;
