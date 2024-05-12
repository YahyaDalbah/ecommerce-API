import Joi from "joi";
import { Types } from "mongoose";

function idValidation(value, helper) {
  if (Types.ObjectId.isValid(value)) {
    return true;
  } else {
    return helper.message("invalid id format");
  }
}

export const validationFields = {
  id: Joi.custom(idValidation),
};