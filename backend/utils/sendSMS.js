const twilio = require('twilio');

const sendSMS = async (to, body) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[SMS DEV] Sent to ${to}: ${body}`);
        return true;
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    try {
        await client.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to
        });
        return true;
    } catch (err) {
        console.error('Twilio Error:', err.message);
        return false;
    }
};

module.exports = sendSMS;
