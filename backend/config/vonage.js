const { Vonage } = require('@vonage/server-sdk');
require('dotenv').config();

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

const sendSMS = async (to, message) => {
  try {
    const from = 'TaskMgmt';
    const response = await vonage.sms.send({
      to,
      from,
      text: message
    });

    console.log('SMS sent:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('SMS error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendSMS };