import { Router } from "express";
import { auth } from "./auth.middleware.js";
import uploadFile, { HME } from "../services/upload.js";
import { verify } from "../services/verify.js";
import user from "../DB/models/user.model.js";
import cloudinary from "../services/cloudinary.js";
import { asyncHandler } from "../services/asyncHandler.js";

const userRouter = Router();

userRouter.get("/profile", auth, (req, res) => {
  res.json(req.id);
});
userRouter.patch(
  "/profilePic",
  auth,
  uploadFile().single("image"),
  HME,
  asyncHandler(async (req, res) => {
    const token = req.headers.token.split("yahya__")[1];
    const { id } = verify(token);
    const {secure_url,public_id} = await cloudinary.uploader.upload(
      req.file.path,
      function (error, result) {
        if(error)console.log(error);
      }
    );
    
    
    const u = await user.findByIdAndUpdate(
      id,
      { profilePic: `${secure_url}`, profilePublicId: public_id },
      { new: false }
    );
    await cloudinary.uploader.destroy(u.profilePublicId);
    return res.json(u);
  })
);

export default userRouter;
