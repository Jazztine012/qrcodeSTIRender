/*const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = socketIo(server);
let cashierQueue = 1;
let registrarQueue = 1;
let frontDeskQueue = 1;

app.get('/join-queue', (req, res) => {
    res.sendFile(path.join(__dirname, 'qrcodeSTI/public/queue.html'));
});

io.on('connection', (socket) => {
    console.log('A client connected');
    socket.on('customer-scanned', (data) => {
        console.log('Customer scanned:', data);
        let updatedQueueNumber;
        if (data.location === 'cashier') {
            updatedQueueNumber = ++cashierQueue;  
        } else if (data.location === 'registrar') {
            updatedQueueNumber = ++registrarQueue; 
        } else if (data.location === 'front-desk') {
            updatedQueueNumber = ++frontDeskQueue; 
        }
        io.emit('update-queue',{
            location: data.location,
            queueNumber: data.queueNumber,
            timestamp: new Date().toLocaleString()
        });
        console.log('Emitting update:', {
            location: data.location,
            queueNumber: updatedQueueNumber,
            timestamp: new Date().toLocaleString()
        });
        const responseData = {
            location: data.location,
            queueNumber: updatedQueueNumber,
            timestamp: new Date().toLocaleString()
        };
        console.log('Emitting update:', responseData); 
        io.emit('update-queue', responseData);
    });
    socket.on('disconnect', () => {
        console.log('A client disconnected');
    });
});
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});*/
const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let cashierQueue = 1;
let registrarQueue = 1;
let frontDeskQueue = 1;
let sseClients = [];

app.get('/join-queue', (req, res) => {
    res.sendFile(path.join(__dirname, 'qrcodeSTI/public/queue.html'));
});
/*app.get('/api/get-customer-data', (req, res) => {
    const customerData = [
        { location: 'cashier', queueNumber: cashierQueue, timestamp: new Date().toLocaleString() },
        { location: 'registrar', queueNumber: registrarQueue, timestamp: new Date().toLocaleString() },
        { location: 'front-desk', queueNumber: frontDeskQueue, timestamp: new Date().toLocaleString() }
    ];

    res.json(customerData);
});*/
app.get('/api/customer-updates', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    sseClients.push(res);

    req.on('close', () => {
        sseClients = sseClients.filter(client => client !== res);
    });
});
function broadcastCustomerUpdate(data) {
    sseClients.forEach(client => client.write(`data: ${JSON.stringify(data)}\n\n`));
}
app.post('/api/customer-updates', (req, res) => {
    const data = req.body;
    let updatedQueueNumber;
    
    if (data.location === 'cashier') {
        updatedQueueNumber = ++cashierQueue;
    } else if (data.location === 'registrar') {
        updatedQueueNumber = ++registrarQueue;
    } else if (data.location === 'front-desk') {
        updatedQueueNumber = ++frontDeskQueue;
    }

    const responseData = {
        location: data.location,
        queueNumber: updatedQueueNumber,
        timestamp: new Date().toLocaleString()
    };
    broadcastCustomerUpdate(responseData);
    res.json(responseData);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
