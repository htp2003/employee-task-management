const nodemailer = require('nodemailer');
require('dotenv').config();

// setup gmail
const mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// send email function
const sendEmail = async (to, subject, text) => {
    console.log('sending email to:', to);

    const mailData = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text
    };

    try {
        const result = await mailer.sendMail(mailData);
        console.log('email sent:', result.messageId);

        return { success: true, id: result.messageId };
    } catch (err) {
        console.log('email error:', err.message);
        return { success: false, error: err.message };
    }
};

// test email function (for debugging)
const testEmail = async () => {
    console.log('testing email service...');

    const test = await sendEmail(
        process.env.EMAIL_USER,
        'Test Email',
        'This is a test message from the app'
    );

    console.log('test result:', test);
    return test;
};

module.exports = { sendEmail, testEmail };