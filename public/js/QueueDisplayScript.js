const queueContainer = document.getElementById('queueContainer');
const loginQueueDisplayPath = '../index.html';
const queuePanelPath = '../html/qr_card.html'; // Path to the queue card template

document.addEventListener('DOMContentLoaded', loadQueueCards);

// Fetch active accounts and generate queue cards
async function loadQueueCards() {
    try {
        const response = await fetch('http://localhost/queue_management/php/fetch_active_accounts.php');
        const accounts = await response.json();
        
        queueContainer.innerHTML = ''; // Clear existing content

        for (const account of accounts) {
            console.log(`Account found: ${account.account_name}`);
            const queueCard = await createQueueCard(account);
            queueContainer.appendChild(queueCard);
            console.log(`Finished creating ${account.account_name} qr card display.`);
        }
    } catch (error) {
        console.error('Error loading queue cards:', error);
    }
}

// Function to create a queue card for each account
async function createQueueCard(account) {
    const location = account.account_name;
    const queueNumber = await fetchCurrentQueue();
    const timestamp = await getServerTime();
    const waitingTime = await fetchAverageWaitingTime();

    const response = await fetch(queuePanelPath);
    const template = await response.text();

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = template.trim();
    const queueCard = tempDiv.firstElementChild;

    if (!queueCard) {
        console.error('Failed to load queue card template');
        return null;
    }
    console.log(`Succesfully created ${account.account_name} card.`);

    // Customize each queue card for the account
    const windowName = queueCard.querySelector('#window-name');
    const qrContainer = queueCard.querySelector('#qr-container');

    windowName.textContent = account.account_name || 'CASHIER'; // Set window name
    
    // Generate QR code
    const qrCodeURL = `https://qrcodesti.onrender.com/queue.html?location=${location}&queue=${queueNumber}&timestamp=${timestamp[1]}&time=${waitingTime}`;
    new QRCode(qrContainer, {
        text: qrCodeURL,
        width: 150,
        height: 150
    });


    // Console Logs 
    console.log(location, queueNumber, timestamp[1].toString());
    console.log(`URL generated: ${qrCodeURL}`);
    return queueCard;
}

// Async function to get average waiting time and return it as an int
async function fetchAverageWaitingTime() {
    let accountID = localStorage.getItem("currentAccountID");
    try {
        const response = await fetch(`http://localhost/queue_management/php/fetch_queue_info.php?account_id=${accountID}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        // Get the average waiting time in the format HH:MM:SS
        let averageWaitingTime = data.average_wait_time;

        // Convert HH:MM:SS to seconds
        if (averageWaitingTime) {
            const timeParts = averageWaitingTime.split(':');
            const hoursInSeconds = parseInt(timeParts[0], 10) * 3600;
            const minutesInSeconds = parseInt(timeParts[1], 10) * 60;
            const seconds = parseInt(timeParts[2], 10);
            const totalSeconds = hoursInSeconds + minutesInSeconds + seconds;

            return totalSeconds;
        }

        // If average_wait_time is null or invalid, return 0 as a default
        return 0;
    } catch (error) {
        console.error('Error fetching queue info:', error);
    }
}

// Async function to get current queue when page is loaded
async function fetchCurrentQueue() {
    try {
        const response = await fetch('http://localhost/queue_management/php/fetch_queue_info.php');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        
        return data.queueNumber
    } catch (error) {
        console.error('Error fetching current queue:', error);
        // alert('Error fetching the current queue. Please try again.');
    }
}

// Gets server time based on the World Time API
async function getServerTime() {
    try {
        const response = await fetch('https://worldtimeapi.org/api/timezone/etc/UTC');
        
        if (!response.ok) {
            throw new Error('Failed to fetch time from the public API.');
        }

        const data = await response.json();
        const utcTime = new Date(data.datetime);
        
        // Convert UTC time to Asia/Manila timezone
        const manilaTimeString = utcTime.toLocaleString("en-US", {
            timeZone: "Asia/Manila",
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        // Get Unix timestamp in seconds for Manila time
        const manilaUnixTimestamp = Math.floor(new Date(utcTime.toLocaleString("en-US", { timeZone: "Asia/Manila" })).getTime() / 1000);

        console.log("Asia/Manila Time:", manilaTimeString);
        console.log("Manila Unix Timestamp:", manilaUnixTimestamp);

        return [ manilaTimeString, manilaUnixTimestamp ];
    } catch (error) {
        console.error("Error fetching server time:", error);
    }
}

function logoutQueueDisplay(event){
    const userConfirmed = confirm("Are you sure you want to log out?");
    
    if (userConfirmed) {
        window.location.href = loginQueueDisplayPath; // Redirect to login page
    } else {
        // Do nothing, user canceled
    }
}

// Function to check if the QR code is still valid
async function isQRCodeValid(qrTimestamp, validityLimitInSeconds = 60) {
    const currentTimeData = await getServerTime();
    
    if (currentTimeData) {
        const currentManilaUnixTimestamp = currentTimeData[1]; // Access the Unix timestamp correctly

        // Calculate the difference in seconds between the current time and the QR code's timestamp
        const timeDifference = currentManilaUnixTimestamp - qrTimestamp;

        console.log("Time Difference (in seconds):", timeDifference);

        // Check if the time difference is within the validity limit
        if (timeDifference <= validityLimitInSeconds) {
            console.log("QR code is valid.");
            return true;
        } else {
            console.log("QR code is expired.");
            return false;
        }
    } else {
        console.error("Could not retrieve current server time.");
        return false;
    }
}


// Example usage
const timestamp = getServerTime().then(timeData => {
    if (timeData) {
        console.log("Manila Time:", timeData.manilaTimeString);
        console.log("Manila Unix Timestamp:", timeData.manilaUnixTimestamp);
    }
});