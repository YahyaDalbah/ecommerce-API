import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to, subject, html) {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: "kkneuldshnetrjhd",
    },
  });
  const info = await transporter.sendMail({
    from: `YAHYA DALBAH <${process.env.EMAIL}>`, // sender address
    to, // list of receivers
    subject, // Subject line
    html, // html body
  });
}
