let cashierQueue = 1;
let registrarQueue = 1;
let frontDeskQueue = 1;
// Generates QR Code to be scanned by the customer
// Links are unique based on location, queue number, and timestamp
function generateQRCode(elementId, location, queueNumber) {
    const now = new Date();
    // Converts date type into a UNIX time type
    const timestamp = Math.floor(now.getTime() / 1000);
    const formattedTimestamp = now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    const qrCodeURL = `https://yamamot000.github.io/qrcodeSTI/public/queue.html?location=${location}&queue=${queueNumber}&timestamp=${timestamp}`;
    document.getElementById(elementId).innerHTML = '';
    new QRCode(document.getElementById(elementId), {
        text: qrCodeURL,
        width: 150,
        height: 150
    });
    document.getElementById(`${elementId}-queue-number`).innerText = queueNumber;
    document.getElementById(`${elementId}-timestamp`).innerText = formattedTimestamp;
    console.log(`QR Code generated for: ${qrCodeURL}`);
}

// Master function that calls the generateQRCodes function 3 times
function refreshQRCodes() {
    generateQRCode('cashier', 'cashier', cashierQueue);
    generateQRCode('registrar', 'registrar', registrarQueue);
    generateQRCode('front-desk', 'front-desk', frontDeskQueue);
}

// Generates a new queue number when QR code is scanned.
/*function updateQueueNumbers(location, newQueueNumber) {
    if (location === 'cashier') {
        cashierQueue = newQueueNumber;
        document.getElementById('cashier-queue-number').textContent = cashierQueue;
        generateQRCode('cashier', 'cashier', cashierQueue);
    } else if (location === 'registrar') {
        registrarQueue = newQueueNumber;
        document.getElementById('registrar-queue-number').textContent = registrarQueue;
        generateQRCode('registrar', 'registrar', registrarQueue);
    } else if (location === 'front-desk') {
        frontDeskQueue = newQueueNumber;
        document.getElementById('front-desk-queue-number').textContent = frontDeskQueue;
        generateQRCode('front-desk', 'front-desk', frontDeskQueue);
    }
}*/

/*const socket = new WebSocket('ws://localhost:3000');

// Event that triggers when a QR is scanned
function onQRCodeScan(location) {
    const data = { location: location };
    socket.send('customer-scanned', data);
}

// Socket EventListener
const socket = new WebSocket('ws://localhost:3000');
    socket.addEventListener('message', function (event) {
        const customerData = JSON.parse(event.data); //const customerData = (event.data);
        const list = document.getElementById('scanned-customers');
        const listItem = document.createElement('li');
        listItem.textContent = `Customer joined: Location: ${customerData.location}, Queue: ${customerData.queueNumber}, Time: ${customerData.timestamp}`;
        list.appendChild(listItem);
    });
    function onQRCodeScan(location) {
        const data = JSON.stringify({ location: location });
        socket.send(data);
    }*/
const eventSource = new EventSource('/api/customer-updates');
eventSource.onmessage = function(event) {
    const customerData = JSON.parse(event.data);

    // Update queue number and display scanned customer based on location
    if (customerData.location === 'cashier') {
        cashierQueue = customerData.queueNumber;
        document.getElementById('cashier-queue-number').textContent = cashierQueue;
        generateQRCode('cashier', 'cashier', cashierQueue);
    } else if (customerData.location === 'registrar') {
        registrarQueue = customerData.queueNumber;
        document.getElementById('registrar-queue-number').textContent = registrarQueue;
        generateQRCode('registrar', 'registrar', registrarQueue);
    } else if (customerData.location === 'front-desk') {
        frontDeskQueue = customerData.queueNumber;
        document.getElementById('front-desk-queue-number').textContent = frontDeskQueue;
        generateQRCode('front-desk', 'front-desk', frontDeskQueue);
    }

    // Display the scanned customer in the "Scanned Customers" list
    const list = document.getElementById('scanned-customers');
    const listItem = document.createElement('li');
    listItem.textContent = `Customer joined: Location: ${customerData.location}, Queue: ${customerData.queueNumber}, Time: ${customerData.timestamp}`;
    list.appendChild(listItem);
};
/*eventSource.onerror = function(event) {
    console.error('Error with SSE:', event);
};*/
refreshQRCodes();
setInterval(refreshQRCodes, 30000);
//window.onload = refreshQRCodes;

