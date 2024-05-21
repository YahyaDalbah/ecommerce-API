import user from "../DB/models/user.model.js";
import { verify } from "../services/verify.js";

export const roles = {
  admin: "admin",
  user: "user",
};

export function auth(accessRoles = []) {
  return async (req, res, next) => {
    try {
      let { token } = req.headers;
      if (!token) {
        return next({ err: "no token", cause: 400 });
      }
      if (!token.startsWith(process.env.BEARER)) {
        return next({ err: "invalid bearer key", cause: 400 });
      }
      token = token.split(process.env.BEARER)[1];
      const { id, iat } = verify(token);
      const authUser = await user.findById(id);
      if (!authUser) {
        return next({
          err: "auth function: user id not registerd",
          cause: 400,
        });
      }
      if (!accessRoles.includes(authUser.role)) {
        return next({ err: "auth function: user not authorized", cause: 403 });
      }
      req.user = { id, userName: authUser.userName, role: authUser.role };

      if (parseInt(authUser.changedPasswordDate?.getTime() / 1000) > iat) {
        return next({ err: "expired token" });
      }
      next();
    } catch (err) {
      return next({ err });
    }
  };
}

export function validate(schema) {
  return (req, res, next) => {
    const input = { ...req.body, ...req.params, ...req.query };

    const validationRes = schema.validate(input);
    if (validationRes.error) {
      return res.status(500).json(validationRes.error);
    }
    next();
  };
}
