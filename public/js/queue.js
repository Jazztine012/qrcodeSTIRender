// SMS AND EMAIL FORM OBJECTS
const smsForm = document.getElementById('sms-form');
const emailForm = document.getElementById('email-form');
const mobileNumberTextInput = document.getElementById('mobile-number');
const emailTextInput = document.getElementById('email-address');
// QUEUE ELEMENT OBJECTS
const windowNameText = document.getElementById('window-name');
const queueNumberText = document.getElementById('queue-number');
const timestampText = document.getElementById('timestamp-text');
const waitingTimeEl = document.getElementById('waiting-time');

// Retrieved from URL
const params = new URLSearchParams(window.location.search);
const data = decodeURIComponent(params.get('queue_data'));

let queueData = {}; // Object to hold queue details
let key, iv; // Encryption key and IV

// Fetch encryption configuration
async function fetchConfig() {
    try {
        const response = await fetch('/config');
        if (!response.ok) {
            throw new Error(`Failed to fetch config: ${response.statusText}`);
        }
        const config = await response.json();

        return {
            key: CryptoJS.enc.Utf8.parse(config.encryptionKey),
            iv: CryptoJS.enc.Utf8.parse(config.iv),
        };
    } catch (error) {
        console.error('Error fetching configuration:', error);
        throw error; // Rethrow to handle in the caller
    }
}

// Decrypt data function
async function decryptData(encryptedData, key, iv) {
    try {
        const decrypted = CryptoJS.AES.decrypt(JSON.stringify(encryptedData), key, {
            iv: iv,
            mode: CryptoJS.mode.CTR,
            padding: CryptoJS.pad.Pkcs7,
        });
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Error decrypting data:', error);
        throw error;
    }
}

// Parse decrypted data
function parseDecryptedData(inputString) {
    const parts = inputString.split('/');
    if (parts.length < 5) {
        throw new Error('Decrypted data is incomplete or malformed.');
    }
    return parts;
}

// Fetch queue data and initialize variables
async function getData() {
    try {
        if (!data) {
            throw new Error('queue_data parameter is missing in the URL.');
        }

        const decryptedData = await decryptData(data, key, iv);
        console.log('Decrypted data:', decryptedData);

        const parsedData = parseDecryptedData(decryptedData);

        queueData = {
            location: parsedData[0],
            number: parsedData[1],
            timestamp: parseInt(parsedData[2]),
            waitingTime: parseInt(parsedData[3]),
            id: parseInt(parsedData[4]),
        };

        console.log(queueData);
    } catch (error) {
        console.error('Error in getData:', error);
        $("#container").load(`invalid_queue.html`);
        $("#form-container").hide();
        alert('This is an invalid queue card.');
    }
}

// Set inner text values
function setInnerTexts() {
    try {
        const { location, number, timestamp, waitingTime, id } = queueData;
        if (!location || !number || !timestamp || !waitingTime || !id) {
            throw new Error('Queue information is incomplete.');
        }

        console.log(`${location} ${number} ${timestamp} ${waitingTime} ${id}`);
        startCountdown();
        windowNameText.innerText = location;
        queueNumberText.innerText = number;
        timestampText.innerText = timestamp;
    } catch (error) {
        console.error('Error in setInnerTexts:', error);
        $("#container").load(`invalid_queue.html`);
        $("#form-container").hide();
        alert('This is an invalid queue card.');
    }
}

// Countdown timer
function startCountdown() {
    const interval = setInterval(() => {
        if (queueData.waitingTime > 0) {
            queueData.waitingTime--;
            const minutes = Math.floor(queueData.waitingTime / 60).toString().padStart(2, '0');
            const seconds = (queueData.waitingTime % 60).toString().padStart(2, '0');
            waitingTimeEl.textContent = `${minutes}:${seconds}`;
        } else {
            clearInterval(interval);
            waitingTimeEl.textContent = '00:00';
        }
    }, 1000);
}

// Send customer data to server
function sendCustomerData() {
    if (!queueData.id) {
        console.error('Queue ID is missing');
        return;
    }

    fetch('https://qrcodesti.onrender.com/api/customer-updates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queueID: queueData.id }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }
            return response.json();
        })
        .then((updatedData) => {
            console.log('Customer data successfully sent:', updatedData);
        })
        .catch((error) => {
            console.error('Error sending customer data:', error);
        });
}

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const config = await fetchConfig();
        key = config.key;
        iv = config.iv;

        await getData();
        setInnerTexts();
        $("#timestamp-text").hide();
        sendCustomerData();
    } catch (error) {
        console.error('Initialization error:', error);
    }
});
