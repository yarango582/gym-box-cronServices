const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'yarangodev@gmail.com',
      pass: 'pdkz ccjj zdts zrqp',
    },
  });

const sendMail = async (subject, html) => {
    try {
        const mailDestinations = process.env.MAIL_DESTINATION.split(',');
        const mailOptions = {
            from: `GYMBOX360 ${process.env.MAIL_USERNAME}`,
            to: mailDestinations,
            subject,
            html,
        };
        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error(error);
        return error;
    }
}

module.exports = {
    sendMail
}