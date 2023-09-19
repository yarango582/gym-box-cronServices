const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
});

const sendMail = async (subject, html) => {
    try {
        const mailDestinations = process.env.MAIL_DESTINATION.split(',');
        const mailOptions = {
            from: process.env.MAIL_USERNAME,
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