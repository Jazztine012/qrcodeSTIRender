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
const data = params.get('queue_data');

let queueLocation;
let queueNumber;
let timestamp;
let waitingTime;
let queueID;

// const key = fetchConfig()[0];
// const iv = fetchConfig()[1];

// Page init
document.addEventListener('DOMContentLoaded', async function() {
    // Fetches and processes data
    await getData(data);
    if (checkTimeValidity(timestamp) == false){
        alert("Invalid queue card. This card has been in timeout.");
        loadInvalidCard();
    }
    // Hides unnecessary elements 
    $("#timestamp-text").hide();
    // Sends customer data and updates is_accessed state in localhost database
    sendCustomerData(queueID);
    // Sets inner texts based on decrypted data
    setInnerTexts(queueLocation, queueNumber, timestamp, waitingTime, queueID);
    // setInterval( function () {
    //     if (!checkTimeValidity()){
    //         loadInvalidCard();
    //     }
    //     // ELSE: continue as usual
    // }, 5000);
    });

// Parent function in processing encrypted data
async function getData(dataToEncrypt) {
    console.log(dataToEncrypt);
    // const queueData = await decryptData(dataToEncrypt, CryptoJS.enc.Utf8.parse(fetchConfig()[0]), CryptoJS.enc.Utf8.parse(fetchConfig()[1]));
    // console.log(queueData);
    const parsedData = await parseDecryptedData(dataToEncrypt);
    console.log(parsedData);
    queueLocation = parsedData[0];
    queueNumber = parsedData[1];
    timestamp = parseInt(parsedData[2]);
    waitingTime = parseInt(parsedData[3]);
    queueID = parseInt(parsedData[4]);

    console.log(`${queueLocation} ${queueNumber} ${timestamp} ${waitingTime} ${queueID} `);
}

function parseDecryptedData(inputString) {
    // Split the string using "/" as the separator
    const parts = inputString.split('/');

    parts.forEach((part, index) => {
        console.log(`Part ${index + 1}: ${part}`);
    });

    return parts;
}

// Event listeners
smsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const mobileNumber = mobileNumberTextInput.value;
    updateMobileNumber(mobileNumber);
});

emailForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailAddress = emailTextInput.value;
    updateEmailAddress(emailAddress);
});

// Function to update mobile number and send SMS notification
async function updateMobileNumber(mobileNumber) {
    try {
        if (!mobileNumber) {
            console.error("No mobile number was received");
            return;
        }
        
        // Store mobile number in localStorage (if necessary)
        localStorage.setItem('mobileNumber', mobileNumber);

        // Call the sendSMSNotification function (ensure it's implemented)
        sendSMSNotification();
    } catch (error) {
        console.error('Error updating mobile number:', error);
    }
}

// Function to update email address and send email notification
async function updateEmailAddress(emailAddress) {
    try {
        if (!emailAddress) {
            console.error("No email address was received");
            return;
        }
        
        // Store email address in localStorage (if necessary)
        localStorage.setItem('emailAddress', emailAddress);

        // Call the sendEmailNotification function (ensure it's implemented)
        sendEmailNotification();
    } catch (error) {
        console.error('Error updating email address:', error);
    }
}

// Checks time and sends a signal if it's time to send a notification
async function checkNotificationTime(){
    try {
        // If it's time to send a notification call the following below:
        // sendEmailNotification();
        // sendSMSNotification();
        // sendNativeNotification();
    } catch (error) {
        console.error(`Error sending notification to user: ${error}`);
    }

}

// Sends email notification in due time
async function sendEmailNotification() {
    try {
        let emailAddress = localStorage.getItem('emailAddress');
        if (!emailAddress) throw new Error('No email address was saved');

        // Fetch email configuration
        const response = await fetch('/config');
        if (!response.ok) throw new Error(`Failed to fetch email configuration: ${response.statusText}`);
        const config = await response.json();

        const emailAccountValue = config.emailAccountValue;
        const emailTemplateValue = config.emailTemplateValue;
        const emailServiceValue = config.emailServiceValue;

        if (!emailAccountValue || !emailTemplateValue || !emailServiceValue) {
            throw new Error('Missing email configuration values from /config');
        }

        // Initialize EmailJS
        emailjs.init(emailAccountValue);

        // Email template parameters
        const emailTemplateParams = {
            to_email: emailAddress, // Recipient's email address
            queue_number: queueNumber, // Queue number to include in the email
            from_name: "qSTI", // Sender's name
            message: `You have received an email notification! Congratulations! It works!`, // Email body
        };

        // Send the email notification
        const emailResponse = await emailjs.send(emailServiceValue, emailTemplateValue, emailTemplateParams);
        console.log("Notification sent successfully:", emailResponse);

        // Check if the response is successful
        if (emailResponse.status === 200) {
            console.log("Email successfully sent!");
            
            // Clear the input field after submission
            emailTextInput.value = "";
        } else {
            console.warn("Email sent, but with issues:", emailResponse);
        }
    } catch (error) {
        console.error(`Error sending email notification: ${error.message}`);
    }
}

// Sends SMS notification in due time
async function sendSMSNotification() {
    try {
        const mobileNumber = localStorage.getItem('mobileNumber'); // Retrieve from localStorage
        if (!mobileNumber) throw new Error('No mobile number was saved');

        const response = await fetch("https://qrcodesti.onrender.com/sendNotification", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mobileNumber }), // Send the mobile number as JSON
        });

        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

        const result = await response.json();
        if (result.success) {
            console.log("SMS sent successfully");
            // Clear the input field after submission
            mobileNumberTextInput.value = "";
        } else {
            throw new Error(result.message || "SMS failed to send");
        }

        localStorage.removeItem('mobileNumber'); // Clean up after successful operation
    } catch (error) {
        console.error(`Error sending SMS notification: ${error}`);
    }
}

// Send an in-browser notification
// TODO: must have a single jingle sound
async function sendNativeNotification(){
    // Have animation here that will notify in-browser
}

// EMAIL TEXT INPUT LISTENERS
// Add an input event listener for dynamic validation
emailTextInput.addEventListener('input', function () {
    // Get the current value of the input field
    let email = emailTextInput.value;

    // Remove whitespace and any invalid characters
    email = email.replace(/\s+/g, ''); // Remove all whitespace
    email = email.replace(/[^a-zA-Z0-9@._-]/g, ''); // Remove invalid characters for email

    // Update the value of the text input field
    emailTextInput.value = email;

    // Check if the email is valid
    if (validateEmail(email)) {
        emailTextInput.style.borderColor = 'green'; // Indicate valid input
    } else {
        emailTextInput.style.borderColor = 'red'; // Indicate invalid input
    }
});

// Function to validate email format
function validateEmail(email) {
    // Regex for validating an email address
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}

// MOBILE TEXT INPUT LISTENERS
// Add an event listener to enforce the rules as the user types
mobileNumberTextInput.addEventListener('input', function () {
    // Remove all characters except numbers and the '+' sign
    this.value = this.value.replace(/[^0-9+]/g, '');

    // Enforce a maximum length of 13 characters
    if (this.value.length > 13) {
        this.value = this.value.slice(0, 13);
    }
});

// Add validation on form submission to ensure the length is between 11 and 13 characters
mobileNumberTextInput.closest('form').addEventListener('submit', function (event) {
    const inputLength = mobileNumberTextInput.value.length;

    if (inputLength < 11 || inputLength > 13) {
        event.preventDefault(); // Prevent form submission
        alert('The mobile number must be between 11 and 13 characters long.');
    }
});

function startCountdown() {
    const interval = setInterval(() => {
        if (waitingTime > 0) {
            waitingTime--;
            const minutes = Math.floor(waitingTime / 60).toString().padStart(2, '0');
            const seconds = (waitingTime % 60).toString().padStart(2, '0');
            waitingTimeEl.textContent = `${minutes}:${seconds}`;
        } else {
            clearInterval(interval);
            waitingTimeEl.textContent = '00:00';
        }
    }, 1000);
}

// Display queue information
function setInnerTexts(queueLocation, queueNumber, timestamp, waitingTime, queueID) {
    try {
        if (queueLocation == "" && queueNumber == "" && timestamp == null && queueID == null && waitingTime == null) {
            throw new Error('Queue information is incomplete.');
        }

        console.log(`${queueLocation} ${queueNumber} ${timestamp} ${waitingTime} ${queueID}`);
        startCountdown();
        windowNameText.innerText = `${queueLocation}`;
        queueNumberText.innerText = `${queueNumber}`;
        timestampText.innerText = `${timestamp}`;
    } catch (error) {
        loadInvalidCard();
    }
}

function loadInvalidCard() {
    $("#container").load(`invalid_queue.html`);
    $("#form-container").hide();
    console.log('Invalid page loaded ', error);
    alert('This is an invalid queue card.');
}

async function checkTimeValidity(timestamp) {
    try {
        const timeNow = await getServerTime(); // Assuming getServerTime is an async function
        if (!timeNow || isNaN(timeNow)) {
            console.error("Error retrieving server time.");
            return false;
        }

        const timestampLimit = timestamp + 60; // 60-second validity
        console.log(`Time now: ${timeNow}, Time in queue: ${timestampLimit}, Original Timestamp: ${timestamp}`);
        return timeNow <= timestampLimit;
    } catch (error) {
        console.error("Error checking time validity:", error);
        return false;
    }
}


// Function to send customer data to the server when the page loads
function sendCustomerData(queueID) {
    if (!queueID) {
        console.error('Queue ID is missing');
        return;
    }

    // Send data to the customer updates endpoint
    fetch('https://qrcodesti.onrender.com/api/customer-updates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({queueID}),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }
            return response.json();
        })
        .then(updatedData => {
            console.log('Customer data successfully sent:', updatedData);
        })
        .catch(error => {
            console.error('Error sending customer data:', error);
        });
}

async function decryptData(encryptedData, key, iv) {
    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(
        CryptoJS.enc.Base64.parse(encryptedData), key, {
        iv: iv,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.NoPadding,
    });

    // Convert decrypted data to UTF-8 string
    return decrypted.toString(CryptoJS.enc.Utf8);
}

async function fetchConfig() {
    try {
        const response = await fetch('/config');
        const config = await response.json();

        // Assign keys from the config
        const key = config.encryptionKey;
        const iv = config.iv;

        console.log('Encryption key and IV retrieved successfully.');
        return { key, iv };
    } catch (error) {
        console.error('Error fetching configuration:', error);
    }
}

// Gets server time based on the World Time API
async function getServerTime() {
    try {
        const response = await fetch('https://timeapi.io/api/time/current/zone?timeZone=Asia%2FManila');
        
        if (!response.ok) {
            throw new Error('Failed to fetch time from the public API.');
        }

        const data = await response.json();

        // Convert the API's datetime string directly to a UNIX timestamp in seconds
        const unixTimeStamp = Math.floor(new Date(data.dateTime).getTime() / 1000);

        return unixTimeStamp;
    } catch (error) {
        console.error("Error fetching server time:", error);

        // Fallback to local time (less reliable)
        return Math.floor(Date.now() / 1000);
    }
}
