const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000; // Use Render's PORT or default to 3000 for local development

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
