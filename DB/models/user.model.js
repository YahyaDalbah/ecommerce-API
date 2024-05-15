import mongoose, { Schema, model,Types } from "mongoose";

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
    min: [2],
    max: [20]
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmEmail: {
    type: Boolean,
    default: false,
  },
  image: {
    type: Object,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  gender: {
    type: String,
    enum: ["male", "female"],
  },
  address: String,
  forgetCode:{
    type: String,
    default: null
  },
  changedPasswordDate:{
    type: Date
  },
  wishList: [{type: Types.ObjectId,ref:"Product"}]
});

const User = mongoose.models.User || model("User", userSchema);
export default User;
