import "dotenv/config";
import express from "express";
import { connectDB } from "./DB/connection.js";
import authRouter from "./api/auth.router.js";
import userRouter from "./api/user.router.js";
import categoryRouter from "./api/category.router.js";
import { gloablaErrorHandler } from "./services/asyncHandler.js";
import couponRouter from "./api/Coupon.router.js";
import brandRouter from "./api/brand.router.js";
import productRouter from "./api/product.router.js";
import cartRouter from "./api/cart.router.js";

const app = express();
const PORT = 3000;
await connectDB();
app.use(express.json());
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/category", categoryRouter);
app.use("/coupon", couponRouter);
app.use("/brand", brandRouter);
app.use("/product", productRouter);
app.use("/cart", cartRouter);
app.listen(PORT, () => {
  console.log("server listening on 3000");
});

app.use(gloablaErrorHandler);
