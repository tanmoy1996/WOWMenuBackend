import nodemailer from "nodemailer";
import { EMAIL_ID, PASSWORD } from "../../config";

const sendMailUtil = async (to, subject, text, htmlBody) => {
  const mailData = {
    from: EMAIL_ID,
    to: to,
    subject: subject,
    text: text,
    html: `${htmlBody}`,
  };
  await transporter.sendMail(mailData, (error) => {
    return !error;
  });
};

const transporter = nodemailer.createTransport({
  port: 465, // true for 465, false for other ports
  host: "smtp.gmail.com",
  auth: {
    user: EMAIL_ID,
    pass: PASSWORD,
  },
  secure: true,
});

export default sendMailUtil;
