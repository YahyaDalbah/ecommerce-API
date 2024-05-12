import { v2 as cloudinary } from "cloudinary";
const api_key = process.env.CLOUDINARY_API_KEY.split('"')[1];
const api_secret = process.env.CLOUDINARY_API_SECRET;
cloudinary.config({
  cloud_name: "do44m9wvz",
  api_key: api_key,
  api_secret: api_secret,
  secure: true,
});

export default cloudinary