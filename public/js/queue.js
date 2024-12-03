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

let queueLocation;
let queueNumber;
let timestamp;
let waitingTime;
let queueID;

// Page init
document.addEventListener('DOMContentLoaded', async function() {
    // Fetches and processes data
    await getData();
    
    if (await checkTimeValidity(timestamp) == false){
        loadInvalidCard();
    }
    // Hides unnecessary elements 
    $("#timestamp-text").hide();
    // Sends customer data and updates is_accessed state in localhost database
    sendCustomerData(queueID);
    // Sets inner texts based on decrypted data
    setInnerTexts(queueLocation, queueNumber, timestamp, waitingTime, queueID);
    // sendNativeNotification();
    });

// Parent function in processing encrypted data
async function getData() {
    const queueData = await decryptData();

    queueLocation = queueData.data[0];
    queueNumber = queueData.data[1];
    timestamp = parseInt(queueData.data[2]);
    waitingTime = parseInt(queueData.data[3]);
    queueID = parseInt(queueData.data[4]);

    console.log(`${queueLocation} ${queueNumber} ${timestamp} ${waitingTime} ${queueID} `);
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
        alert("Mobile number saved.");
        // Clear the input field after submission
        mobileNumberTextInput.value = "";

        // Call the sendSMSNotification function (ensure it's implemented)
        // sendSMSNotification();
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
        alert("Email saved.");
        // Clear the input field after submission
        emailTextInput.value = "";

        // Call the sendEmailNotification function (ensure it's implemented)
        // sendEmailNotification();
    } catch (error) {
        console.error('Error updating email address:', error);
    }
}

async function startCountdown() {
    try {
        let remainingTime = waitingTime; // Remaining time in seconds
        const halfTime = Math.floor(remainingTime / 2); // Half-time trigger

        const interval = setInterval(() => {
            if (remainingTime > 0) {
                remainingTime--;
                const minutesLeft = Math.ceil(remainingTime / 60);

                // Display countdown as "Estimated time left: X minutes left"
                waitingTimeEl.textContent = `Estimated time left: ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} left`;

                // Trigger notifications
                if (remainingTime === 180 || (remainingTime === halfTime && waitingTime < 180)) {
                    triggerNotifications();
                }
            } else {
                clearInterval(interval);
                waitingTimeEl.textContent = "Estimated time left: 0 minutes left";
            }
        }, 1000); // Update every second
    } catch (error) {
        console.error("Error starting countdown:", error);
    }
}

// Function to trigger notifications
function triggerNotifications() {
    try {
        sendEmailNotification();
        sendSMSNotification();
        sendNativeNotification();
        console.log("Notifications triggered.");
    } catch (error) {
        console.error("Error triggering notifications:", error);
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
async function sendNativeNotification(){
    let modalNotification = new bootstrap.Modal(document.getElementById('modal-notification'));
    document.getElementById('queue-location').innerText = queueLocation.replaceAll('_', ' ');
    modalNotification.show();
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

// Display queue information
function setInnerTexts(queueLocation, queueNumber, timestamp, waitingTime, queueID) {
    try {
        if (queueLocation == "" && queueNumber == "" && timestamp == null && queueID == null && waitingTime == null) {
            throw new Error('Queue information is incomplete.');
        }

        console.log(`${queueLocation} ${queueNumber} ${timestamp} ${waitingTime} ${queueID}`);
        startCountdown();
        const newQueueLocation = queueLocation.replaceAll("_", " ");
        windowNameText.innerText = `${newQueueLocation}`;
        queueNumberText.innerText = `${queueNumber}`;
        timestampText.innerText = `${timestamp}`;
    } catch (error) {
        loadInvalidCard();
    }
}

function loadInvalidCard() {
    $("#container").load(`invalid_queue.html`);
    $("#form-container").hide();
    console.log('Invalid page loaded');
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

async function decryptData() {
    // Extract the 'queue_data' parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const encryptedData = urlParams.get("d");

    const decryptionKey = await fetchConfig();

    if (encryptedData) {
        try {
            // Decrypt the data
            const bytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedData), decryptionKey);
            const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

            console.log("Decrypted Data:", decryptedData);
            
            return decryptedData;
        } catch (error) {
            console.error("Decryption failed:", error);
            loadInvalidCard()
        }
    } else {
        console.warn("No data found in URL parameters.");
        loadInvalidCard()
    }
}

async function fetchConfig() {
    try {
        const response = await fetch('/config');
        const config = await response.json();

        // Assign keys from the config
        const key = config.encryptionKey;
        
        if (key) return key;
        throw new Error("Encryption key not fetched.");
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
