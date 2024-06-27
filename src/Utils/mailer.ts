import * as nodemailer from 'nodemailer';
import * as inlineBase64 from 'nodemailer-plugin-inline-base64';
import * as dotenv from 'dotenv';
dotenv.config();

export async function sendEmail({ email, subject, html }) {
  try {
    const transporter: nodemailer.Transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: subject,
      html: html,
    };

    transporter.use('compile', inlineBase64({ cidPrefix: 'somePrefix_' }));
    await transporter.sendMail(mailOptions);
  } catch (err) {
    throw new Error(err.message);
  }
}
