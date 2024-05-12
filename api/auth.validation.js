import joi from "joi";

export const loginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});
export const signupSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
  cPassword: joi.string().valid(joi.ref("password")).required(),
  userName: joi.string().alphanum().required(),
});
