import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line unicorn/prefer-module, @typescript-eslint/no-var-requires
const sgMail = require('@sendgrid/mail');

import { SendEmailProperties } from './types';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly configService: ConfigService) {}

  async sendEmail({
    toEmail,
    subject,
    content,
  }: SendEmailProperties): Promise<void> {
    const sendgridApiKey = this.configService.get('SENDGRID_API_KEY');
    if (!sendgridApiKey) {
      throw new Error('SENDGRID_API_KEY is missing.');
    }
    const sendgridSenderMail = this.configService.get('sendgridSenderMail');
    if (!sendgridSenderMail) {
      throw new Error('sendgridSenderMail is missing.');
    }
    sgMail.setApiKey(sendgridApiKey);
    const message = {
      to: toEmail,
      from: sendgridSenderMail,
      subject: subject,
      html: content,
    };

    try {
      await sgMail.send(message);
    } catch (error) {
      this.logger.error(`Error sending email to ${toEmail}:`, { error });
      throw new BadRequestException(
        'Something went wrong while sending the verification email!',
      );
    }
  }

  generateVerifyMailContent(email: string, verfiyToken: string) {
    return `<html>
      <head>
        <title>Verify your email address</title>
      </head>
      <body>
        <h1>Verify your email address</h1>
        <p>Hello,</p>
        <p>Thank you for signing up with our app. To complete the registration process, please click the button below to verify your email address:</p>
        <a href="${this.configService.get(
          'WEB_URL',
        )}/verify?email=${email}&token=${verfiyToken}" style="background-color: #283618; border: none; color: #F7F7E8; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin-bottom: 20px;">Verify Email Address</a>
        <p>If you did not sign up for our app, please ignore this message.</p>
        <p>Best regards,<br>GetawayPlan Team</p>
      </body>
      </html>`;
  }
}
