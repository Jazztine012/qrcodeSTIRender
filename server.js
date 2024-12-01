const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const twilio = require("twilio");
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({
    origin: 'https://qrcodesti.onrender.com',
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
        const { mobileNumber } = req.body;
        if (!mobileNumber) {
            return res.status(400).json({ success: false, message: "Mobile number is required." });
        }

        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
        const message = await client.messages.create({
            body: `You have successfully received an SMS notification congrats!`,
            from: "+17752584445",
            to: mobileNumber,
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
    });
});

// WebSocket Server
// const wss = new WebSocket.Server({ port: 8080 });
// wss.on('connection', (ws) => {
//     console.log('Client connected');
//     ws.on('message', (message) => ws.send(`Server received: ${message}`));
//     ws.on('close', () => console.log('Client disconnected'));
// });

app.listen(port, () => console.log(`Server running on port ${port}`));
