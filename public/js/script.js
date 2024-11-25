const queueContainer = document.getElementById('queueContainer');
const loginQueueDisplayPath = '../index.html';
const queuePanelPath = '../html/qr_card.html'; // Path to the queue card template

document.addEventListener('DOMContentLoaded', function(){
    // loadQueueCards();
});

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
        const currentManilaUnixTimestamp = currentTimeData.manilaUnixTimestamp;

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