import mongoose, { Schema, Types, model } from "mongoose";

const cartSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  products: [
    {
      productId: { type: Types.ObjectId, ref: "Product" },
      qty: { type: Number, default: 1 },
    },
  ],
});

const Cart = mongoose.models.Cart || model("Cart", cartSchema);
export default Cart;
