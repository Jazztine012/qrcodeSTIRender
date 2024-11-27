const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Use CORS middleware
app.use(cors()); // Allow all origins

// Middleware to parse JSON body
app.use(express.json());

// Endpoint to append to file
app.post('/append', (req, res) => {
    const { queueID } = req.body;

    if (!queueID || isNaN(queueID)) {
        return res.status(400).json({ success: false, message: 'Invalid queueID' });
    }

    // Path to the file
    const filePath = './accessed_queues.txt';

    // Append queueID to the file
    fs.appendFile(filePath, `${queueID}\n`, (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).json({ success: false, message: 'Error writing to file' });
        }

        res.json({ success: true, message: 'Queue ID added successfully' });
    });
});

// Start the server
app.listen(3000, () => console.log('Server is running on port 3000'));
