//src/email/email.service.ts
import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { env } from "src/config/env.config";

@Injectable()
export class EmailService{
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    private transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: env.EMAIL_USER,
            pass: env.EMAIL_PASS,
        },
    });

    async sendOtpEmail(to: string, otp: string): Promise<void> {
        const mailOptions = {
            from : "COURSEHUB",
            to,
            subject:"eamilSending",
            html: `<p> Your email is ${otp}{</p>`
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        await this.transporter.sendMail(mailOptions);
    }
}