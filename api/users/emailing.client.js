const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const nodemailer = require('nodemailer');

class EmailingClient {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });
  }

  async sendVerificationEmail(email, velificationLink) {
    return this.transporter.sendMail({
      to: email,
      from: process.env.NODEMAILER_EMAIL,
      subject: 'Please, verify your email',
      html: `<a href="${velificationLink}">Your verification link</a>`,
    });
  }
}

exports.emailingClient = new EmailingClient();
