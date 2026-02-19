const twilio = require('twilio');

const sendSMS = async (to, body) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[SMS DEV] Sent to ${to}: ${body}`);
        return true;
    }

    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_PHONE_NUMBER;

    // Check if Twilio is properly configured
    if (!sid || !sid.startsWith('AC') || !token || !from) {
        console.log('--- TWILIO MOCK MODE ---');
        console.log('Credentials missing or invalid (SID must start with AC)');
        console.log(`Would have sent to ${to}: ${body}`);
        return true; // Return true to allow the process to continue even without real SMS
    }

    try {
        const client = twilio(sid, token);
        await client.messages.create({
            body,
            from,
            to
        });
        return true;
    } catch (err) {
        console.error('Twilio Error:', err.message);
        // We return true here as well to prevent blocking the user experience if SMS fails
        return true;
    }
};

module.exports = sendSMS;
