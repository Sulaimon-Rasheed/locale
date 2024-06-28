import * as nodemailer from 'nodemailer';
import * as inlineBase64 from 'nodemailer-plugin-inline-base64';
import { ConfigService } from '@nestjs/config';

interface SendEmailOptions {
  email: string;
  subject: string;
  html: string;
}

export async function sendEmail(sendEmailOptions:SendEmailOptions, configService:ConfigService) {
  const { email, subject, html } = sendEmailOptions
  
  try {
    const AUTH_EMAIL:string = configService.get<string>('AUTH_EMAIL');
    const AUTH_PASS:string = configService.get<string>('AUTH_PASS');
    
    const transporter: nodemailer.Transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user:AUTH_EMAIL,
        pass:AUTH_PASS,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from:AUTH_EMAIL,
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
