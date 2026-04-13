const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Professional Mail Server is Live!"));

app.post('/send-mail', async (req, res) => {
    const { name, email, phone, message } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // 1. AAPKO JO MAIL MILEGA (Admin Notification)
    const adminMail = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `🚀 New Inquiry: ${name}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #333;">New Portfolio Message</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Phone:</b> ${phone}</p>
                <p><b>Message:</b></p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</div>
            </div>
        `
    };

    // 2. USER KO JO JAYEGA (Professional Auto-Reply)
    const autoReply = {
        from: `"D Kumar | Portfolio" <${process.env.EMAIL_USER}>`, // Professional Sender Name
        to: email,
        subject: `Confirmation: We've received your message, ${name}!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
                    <h1>Thank You!</h1>
                </div>
                <div style="padding: 20px; color: #333; line-height: 1.6;">
                    <p>Hi <b>${name}</b>,</p>
                    <p>Thank you for reaching out through my portfolio website. This is an automated confirmation to let you know that your message has been safely delivered to my server.</p>
                    <p>I have received your inquiry and will review it shortly. You can expect a response from me within the next 24-48 hours.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 0.9em; color: #666;"><b>Your Message Preview:</b><br><i>"${message}"</i></p>
                </div>
                <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 0.8em; color: #888;">
                    © 2026 D Kumar Portfolio. All rights reserved.
                </div>
            </div>
        `
    };

    try {
        // Dono mails bhej rahe hain
        await transporter.sendMail(adminMail);
        await transporter.sendMail(autoReply);
        
        res.status(200).json({ success: true, message: "Emails sent successfully!" });
    } catch (error) {
        console.error("Nodemailer Error:", error);
        res.status(500).json({ success: false, message: "Server couldn't send the email." });
    }
});

module.exports = app;
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));