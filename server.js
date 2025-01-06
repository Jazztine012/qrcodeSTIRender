const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const twilio = require("twilio");
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 4000;

// const allowedOrigins = ['http://localhost', 'https://qrcodesti.onrender.com'];

app.use(cors({
    origin: 'https://qrcodesti.onrender.com',
    // origin: function (origin, callback) {
    //     if (!origin || allowedOrigins.includes(origin)) {
    //         callback(null, true); // Allow the request
    //     } else {
    //         callback(new Error('Not allowed by CORS')); // Block the request
    //     }
    // },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Append Queue ID to File
function appendToAccessedQueue(queueID) {
    const filePath = path.join(__dirname, 'public', 'accessed_queues.txt');
    fs.appendFile(filePath, `${queueID}\n`, (err) => {
        if (err) {
            console.error('Error appending to file:', err);
        } else {
            console.log(`Queue ID ${queueID} appended to accessed_queues.txt`);
        }
    });
}

// Handle Customer Updates
app.post('/api/customer-updates', (req, res) => {
    const data = req.body;

    appendToAccessedQueue(data.queueID);
});

// SMS Notification
app.post("/sendNotification", async (req, res) => {
    try {
        const { mobile_number, queue_number, queue_location } = req.body;
        if (!mobileNumber || !queue_number || !queue_location) {
            return res.status(400).json({ success: false, message: "Mobile number, queue number, and queue location are required." });
        }

        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        const message = await client.messages.create({
            body: `Good day! We would like to inform you about your queue ${queue_number} at the ${queue_location} service desk!
            \nKindly return to the designated service desk as soon as possible if you haven't already, thank you!`,
            from: "+17752584445",
            to: mobile_number,
        });

        res.status(200).json({ success: true, message: "Notification sent successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: `Failed to send notification: ${error.message}` });
    }
});

// Email Config
app.get('/config', (req, res) => {
    res.json({
        emailAccountValue: process.env.EMAIL_ACCOUNT_VALUE,
        emailTemplateValue: process.env.EMAIL_TEMPLATE_VALUE,
        emailServiceValue: process.env.EMAIL_SERVICE_VALUE,
        encryptionKey: process.env.ENCRYPTION_KEY,
        iv: process.env.ENCRYPTION_IV,
    });
});

app.post('/decrypt', (req, res) => {
    try {
        const { encryptedText } = req.body;

        if (!encryptedText) {
            return res.status(400).json({ success: false, message: 'Encrypted text is required.' });
        }

        const decryptedText = decrypt(encryptedText); // Use the decrypt function
        res.status(200).json({ success: true, decryptedText });
    } catch (error) {
        console.error('Decryption error:', error);
        res.status(500).json({ success: false, message: 'Decryption failed.' });
    }
});


app.listen(port, () => console.log(`Server running on port ${port}`));
