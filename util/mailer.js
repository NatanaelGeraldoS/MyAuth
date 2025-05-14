const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

function sendEmail(to, subject, html) {
    transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log("Server is ready to take our messages");
        }
    });

    const mailOptions = {
        from: '"MyAuth" <noreply@natanaelgeraldo.com>',
        to: to,
        subject: subject,
        html: html,
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log("Send Email error:", err); // ✅ Correct error object
        } else {
            console.log("Email sent:", info.response); // ✅ Log success
        }
    });

    return null;
}

module.exports = sendEmail;
