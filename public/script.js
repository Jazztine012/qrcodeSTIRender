let cashierQueue = 1;
let registrarQueue = 1;
let frontDeskQueue = 1;

function generateQRCode(elementId, location, queueNumber) {
    const now = new Date();
    const timestamp = now.toISOString();
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
function updateQueueNumbers(location, newQueueNumber) {
    if (location === 'cashier') {
        cashierQueue = newQueueNumber;
        generateQRCode('cashier', 'cashier', cashierQueue);
    } else if (location === 'registrar') {
        registrarQueue = newQueueNumber;
        generateQRCode('registrar', 'registrar', registrarQueue);
    } else if (location === 'front-desk') {
        frontDeskQueue = newQueueNumber;
        generateQRCode('front-desk', 'front-desk', frontDeskQueue);
    }
}

const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('message', function (event) {
    const customerData = JSON.parse(event.data);
    console.log('Customer data received:', customerData);

    const list = document.getElementById('scanned-customers');
    const listItem = document.createElement('li');
    listItem.textContent = `Customer joined: Location: ${customerData.location}, Queue: ${customerData.queueNumber}, Time: ${customerData.timestamp}`;
    list.appendChild(listItem);

    updateQueueNumbers(customerData.location, customerData.queueNumber);
});

window.onload = function() {
    generateQRCode('cashier', 'cashier', cashierQueue);
    generateQRCode('registrar', 'registrar', registrarQueue);
    generateQRCode('front-desk', 'front-desk', frontDeskQueue);
};
