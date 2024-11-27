const express = require('express');
const path = require('path');
const cors = require('cors');
const twilio = require("twilio");
const app = express();
const port = process.env.PORT || 4000; // Use Render's PORT or default to 3000 for local development

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let cashierQueue = 1;
let registrarQueue = 1;
let frontDeskQueue = 1;
let sseClients = [];

// Serve the main page for joining the queue
app.get('/join-queue', (req, res) => {
    res.sendFile(path.join(__dirname, 'qrcodeSTI/public/queue.html'));
});

// SSE Endpoint for real-time customer updates
app.get('/api/customer-updates', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    sseClients.push(res);

    // Remove client on disconnect
    req.on('close', () => {
        sseClients = sseClients.filter(client => client !== res);
    });
});

// Helper function to broadcast updates to all SSE clients
function broadcastCustomerUpdate(data) {
    sseClients.forEach(client => client.write(`data: ${JSON.stringify(data)}\n\n`));
}

// API endpoint to handle customer updates and broadcast to clients
app.post('/api/customer-updates', (req, res) => {
    const data = req.body;
    let updatedQueueNumber;
    
    // Increment the correct queue number based on location
    if (data.location === 'cashier') {
        updatedQueueNumber = ++cashierQueue;
    } else if (data.location === 'registrar') {
        updatedQueueNumber = ++registrarQueue;
    } else if (data.location === 'front-desk') {
        updatedQueueNumber = ++frontDeskQueue;
    }

    // Prepare response data
    const responseData = {
        location: data.location,
        queueNumber: updatedQueueNumber,
        timestamp: new Date().toLocaleString()
    };

    // Broadcast the update to SSE clients
    broadcastCustomerUpdate(responseData);

    // Send response to the requester
    res.json(responseData);
});

// Start the server and log the port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// server side SMS notification
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
  
      console.log("Message SID:", message.sid);
      res.status(200).json({ success: true, message: "Notification sent successfully!" });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ success: false, message: `Failed to send notification: ${error.message}` });
    }
  });
  
// Returns API keys for email notification
app.get('/config', (req, res) => {
    res.json({
        emailAccountValue: process.env.EMAIL_ACCOUNT_VALUE,
        emailTemplateValue: process.env.EMAIL_TEMPLATE_VALUE,
        emailServiceValue: process.env.EMAIL_SERVICE_VALUE,
    });
});


const WebSocket = require('ws');

// Create a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Listen for messages from the client
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        // Echo the message back to the client
        ws.send(`Server received: ${message}`);
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');

const corsOptions = {
    origin: 'https://qrcodesti.onrender.com',
    methods: ['POST'], // Restrict to specific HTTP methods
    allowedHeaders: ['Content-Type'], // Allow only specific headers
};
app.use(cors(corsOptions));

// Endpoint to append to file
app.post('/api/append', (req, res) => {
    const { queueID } = req.body;

    if (!queueID || isNaN(queueID)) {
        return res.status(400).json({ success: false, message: 'Invalid queueID' });
    }

    // Path to the file
    const filePath = './public/accessed_queues.txt';

    // Append queueID to the file
    fs.appendFile(filePath, `${queueID}\n`, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).json({ success: false, message: 'Error writing to file' });
        }

        res.json({ success: true, message: 'Queue ID added successfully' });
    });
});