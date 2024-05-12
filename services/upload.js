import multer from "multer";

export function HME(err, req, res, next) {
  if (err) {
    return res.status(400).json({ message: "multer error", err });
  } else {
    next();
  }
}

export default function uploadFile() {
  const storage = multer.diskStorage({});

  function fileFilter(req, file, cb) {
    if (file.mimetype.includes("image")) {
      cb(null, true);
    } else {
      cb("invalid format", false);
    }
  }

  const upload = multer({ storage, fileFilter });
  return upload;
}
