import { Router } from "express";
import user from "../DB/models/user.model.js";
import { hash } from "../services/hash.js";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../services/asyncHandler.js";
import { loginSchema, signupSchema } from "./auth.validation.js";
import { roles, validate } from "./auth.middleware.js";
import { sendEmail } from "../services/email.js";
import { verify } from "../services/verify.js";
import { customAlphabet } from "nanoid";
import User from "../DB/models/user.model.js";

const router = Router();

router.post(
  "/signup",
  validate(signupSchema),
  asyncHandler(async (req, res) => {
    const { userName, email, password, role } = req.body;

    const found = await user.findOne({ email });

    if (found) {
      return res.json("exists");
    }
    const hashPass = hash(password);
    const userInfo = await user.create({
      userName,
      password: hashPass,
      email,
      role,
    });
    const token = jwt.sign(
      { id: userInfo._id, role: userInfo.role },
      process.env.SIGN,
      { expiresIn: 60 * 60 }
    );
    const refreshToken = jwt.sign(
      { id: userInfo._id, role: userInfo.role },
      process.env.SIGN,
      { expiresIn: 60 * 60 * 24 * 365 }
    );
    await sendEmail(
      //it may be sent in spam
      email,
      "email verification link",
      `<a href="${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}">verify email </a><br /> <br /><a href="${req.protocol}://${req.headers.host}/auth/sendConfirmEmail/${refreshToken}">send another email </a>`
    );
    res.status(201).json({ accessToken: token, refreshToken });
  })
);
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const userInfo = await user.findOne({ email });
    if (!userInfo) {
      return res.json("email not exists");
    }
    const matchPass = compare(password, userInfo.password);
    if (matchPass) {
      const token = jwt.sign(
        { id: userInfo._id, role: userInfo.role },
        process.env.SIGN,
        { expiresIn: 60 * 60 }
      );
      const refreshToken = jwt.sign(
        { id: userInfo._id, role: userInfo.role },
        process.env.SIGN,
        { expiresIn: 60 * 60 * 24 * 365 }
      );
      res.json({ accessToken: token, refreshToken });
    } else {
      res.json("password not match");
    }
  })
);
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const { id, role } = verify(refreshToken);
    const token = jwt.sign({ id, role }, process.env.SIGN, {
      expiresIn: 60 * 60,
    });
    return res.json(token)
  })
);
router.get(
  "/confirmEmail/:token",
  asyncHandler(async (req, res) => {
    const { token } = req.params;

    const { email } = verify(token);
    if (!email) {
      return res.json("invalid token");
    }

    const found = await user.findOne({ email });

    if (!found) {
      return res.json("email not found");
    }
    const userInfo = await user.updateOne({ email }, { confirmEmail: true });
    res.json(userInfo);
  })
);
router.get(
  "/sendConfirmEmail/:token",
  asyncHandler(async (req, res) => {
    let { token } = req.params;

    const { email } = verify(token);
    if (!email) {
      return res.json("invalid token");
    }

    const found = await user.findOne({ email });

    if (!found) {
      return res.json("email not found");
    }
    token = jwt.sign({ email }, process.env.SIGN, { expiresIn: 60 * 5 });
    const refreshToken = jwt.sign({ email }, process.env.SIGN, {
      expiresIn: 60 * 60 * 24,
    });
    await sendEmail(
      //it may be sent in spam
      email,
      "email verification link",
      `<a href="${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}">verify email </a><br /> <br /><a href="${req.protocol}://${req.headers.host}/auth/sendConfirmEmail/${refreshToken}">send another email </a>`
    );
    res.json("new email sent");
  })
);
router.patch(
  "/sendCode",
  asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const code = customAlphabet("123456789abcd", 4)();
    const user = await User.findOneAndUpdate(
      { email },
      { forgetCode: code },
      { new: true }
    );
    if (!user) {
      return next({ err: "sendCode error: email not found" });
    }

    await sendEmail(email, "password change", `code is ${code}`);
    return res.json({ message: "code sent" });
  })
);
router.patch(
  "/forgetPassword",
  asyncHandler(async (req, res, next) => {
    const { email, password, code } = req.body;
    const user = await User.findOne({ email });
    if (user.forgetCode != code) {
      return next({ err: "forgetPassword error: code is not matched" });
    }
    user.password = password;
    user.changedPasswordDate = Date.now();
    await user.save();
    return res.json(user);
  })
);
export default router;
