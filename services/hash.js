import bcrypt from "bcrypt";

export function hash(plainText) {
  const pass = bcrypt.hashSync(plainText, parseInt(process.env.SALTROUNDS));

  return pass;
}
