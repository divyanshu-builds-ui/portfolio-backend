const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json()); 

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // YE SARE OPTIONS NETWORKING ERROR FIX KARNE KE LIYE HAIN
    options: {
        family: 4 // Ye force karega ki sirf IPv4 use ho (IPv6 ignore ho jayega)
    },
    tls: {
        rejectUnauthorized: false 
    }
});

// Verify connection
transporter.verify(function (error, success) {
    if (error) {
        console.log("Transporter error (Check IPv4): ", error);
    } else {
        console.log("✅ SUCCESS: Server is ready to take our messages!");
    }
});

// Verify connection configuration (Isse logs mein pata chal jayega agar error hai)
transporter.verify(function (error, success) {
    if (error) {
        console.log("Transporter error: ", error);
    } else {
        console.log("Server is ready to take our messages");
    }
});
// Main Route for Form Submission
app.post('/send-mail', (req, res) => {
    const { name, email, phone, message } = req.body;

    // 1. Notification Mail to YOU
const adminMail = {
    // Gmail sirf aapka apna email hi "from" mein allow karta hai
    from: process.env.EMAIL_USER, 
    to: process.env.EMAIL_USER,
    // User ka email aap "Reply-To" mein daal sakte ho
    replyTo: email, 
    subject: `🚀 New Portfolio Inquiry from ${name}`,
    text: `You have received a new message:\n\n` +
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          `Phone: ${phone}\n\n` +
          `Message:\n${message}`
};

    // 2. Professional Auto-Reply to the USER
    const autoReply = {
        from: `"Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Thank you for reaching out, ${name}!`,
        text: `Hello ${name},\n\nThank you for contacting me through my portfolio. I have received your message regarding: \n\n"${message}"\n\nI will review your inquiry and get back to you as soon as possible.\n\nBest Regards,\n[Your Name]`
    };

    // Sending the Admin Email first
    transporter.sendMail(adminMail, (error, info) => {
        if (error) {
            console.log("Error occurred:", error.message);
            return res.status(500).json({ 
                success: false, 
                message: "Internal Server Error. Email not sent." 
            });
        }

        console.log("Admin notification sent: " + info.response);

        // Send Auto-Reply in the background (User doesn't have to wait for this)
        transporter.sendMail(autoReply, (err, info) => {
            if (err) console.log("Auto-reply failed:", err.message);
            else console.log("Auto-reply sent to user.");
        });

        // Send success response to Frontend
        res.status(200).json({ 
            success: true, 
            message: "Success! Message sent and auto-reply triggered." 
        });
    });
});

// Port Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`🚀 Server is running on port: ${PORT}`);
    console.log(`📧 Connected Email: ${process.env.EMAIL_USER}`);
    console.log(`-------------------------------------------`);
});