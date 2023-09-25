const config = require('../../config/config');
const { twilio: { accountSid, authToken, numberFrom } } = config;
const client = require('twilio')(accountSid, authToken);

const sendWhatsAppMessage = async (to, body) => {

    client.messages
        .create({
            body,
            from: `whatsapp:${numberFrom}`,
            to: `whatsapp:+57${to}`
        })
        .then(message => message)
        .catch(error => console.error(error));

};

const sendSMS = async (to, body) => {

    client.messages
        .create({
            body: body,
            from: `${numberFrom}`,
            to: `+57${to}`
        }, (err, message) => {
            if (err) {
                console.error(err);
            }
            console.log(message.sid);
        })
        .then(message => message)
        .catch(error => console.error(error));

};

module.exports = {
    sendWhatsAppMessage,
    sendSMS
};