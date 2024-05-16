import "dotenv/config";
import express from "express";
import { connectDB } from "./DB/connection.js";
import authRouter from "./api/auth.router.js";
import userRouter from "./api/user.router.js";
import categoryRouter from "./api/category.router.js";
import { gloablaErrorHandler } from "./services/asyncHandler.js";
import couponRouter from "./api/coupon.router.js";
import brandRouter from "./api/brand.router.js";
import productRouter from "./api/product.router.js";
import cartRouter from "./api/cart.router.js";
import cors from "cors"

const app = express();
const PORT = process.env.PORT || 3000;
var whitelist = ["http://127.0.0.1:5500", "http://localhost:3000"];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions))
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
  console.log(`server listening on ${PORT}`);
});

app.use(gloablaErrorHandler);
