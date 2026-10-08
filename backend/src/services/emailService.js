const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const sendEmail = async (to, subject, text, html) => {
  if (process.env.NODE_ENV === 'test') {
    logger.info(`[Mock Email] To: ${to}, Subject: ${subject}`);
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"ResolveIT System" <noreply@resolveit.com>',
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Failed to send email to ${to}: ${error.message}`);
    return false;
  }
};

module.exports = { sendEmail };
