const config = require('../../config/config');
const { twilio: { accountSid, authToken, numberFrom } } = config;
const client = require('twilio')(accountSid, authToken);

const sendWhatsAppMessage = async (to, body) => {

    client.messages.create({
        body,
        from: `whatsapp:${numberFrom}`,
        to: `whatsapp:+57${to}`
    })
    .then(message => message.id)
    .catch(error => console.error(error));

};

module.exports = {
    sendWhatsAppMessage,
};