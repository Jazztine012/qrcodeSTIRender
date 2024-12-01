const mobileNumberTextInput = document.getElementById('mobile-number');
const emailTextInput = document.getElementById('email-address');

// JavaScript to manage tab switching and forms
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for form submission
    const smsForm = document.getElementById('sms-form');
    const emailForm = document.getElementById('email-form');

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

// REIMPORT FROM OLD FILES
const windowNameText = document.getElementById('window-name');
const queueNumberText = document.getElementById('queue-number');
const timestampText = document.getElementById('timestamp-text');
const queueMessageText = document.getElementById('confirmation-text');
const waitingTimeEl = document.getElementById('waiting-time');
const token = new URLSearchParams(window.location.search).get('token');
const params = new URLSearchParams(window.location.search);
const queueLocation = params.get('location');
const queueNumber = params.get('queue');
const queueID = params.get('queueID');
const timestamp = new Date(params.get('timestamp')).toLocaleString();
// const timestamp = params.get('timestamp');

console.log(`queueID from the queue is: ${queueID || null}`);

// Countdown timer for estimated waiting time
let totalSeconds = 300; // 5 minutes

function startCountdown() {
    const interval = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds--;
            const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const seconds = (totalSeconds % 60).toString().padStart(2, '0');
            waitingTimeEl.textContent = `${minutes}:${seconds}`;
        } else {
            clearInterval(interval);
            waitingTimeEl.textContent = '00:00';
        }
    }, 1000);
}

// Display queue information
function setInnerTexts() {
    try {
        if (queueLocation && queueNumber && timestamp) {
            console.log(queueLocation, ' ', queueNumber, ' ', timestamp);
            startCountdown();
            windowNameText.innerText = `${queueLocation}`;
            queueNumberText.innerText = `${queueNumber}`;
            timestampText.innerText = `${timestamp}`;
        } else {
            throw new Error('Queue information is incomplete.');
        }
    } catch (error) {
        $("#container").load(`invalid_queue.html`);
        $("#form-container").hide();
        console.log('Invalid page loaded');
        alert('This is an invalid queue card.');
    }
}

async function appendQueueID() {
    try {
        const response = await fetch('https://qrcodesti.onrender.com/api/append', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ queueID }),
        });
        const result = await response.json();
        console.log(result.message);
    } catch (error) {
        console.error('Error appending Queue ID:', error);
    }
}

// Function to send customer data to the server when the page loads
function sendCustomerData() {
    // Check if all required data is available
    if (!queueLocation || !queueNumber || !timestamp || !queueID) {
        console.error('Missing data: queueLocation, queueNumber, queueID, or timestamp is not defined.');
        return;
    }

    const customerData = {
        location: queueLocation,
        queueNumber: queueNumber,
        timestamp: timestamp,
        queueID: queueID,
    };

    console.log('Sending customer data:', customerData);

    // Send data to the customer updates endpoint
    fetch('https://qrcodesti.onrender.com/api/customer-updates', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server error: ${response.statusText}`);
            }
            return response.json();
        })
        .then(updatedData => {
            console.log('Customer data successfully sent:', updatedData);
            // Optionally, update UI with the response data
            // Example:
            // document.getElementById('confirmation-text').innerText = `Queue Number: ${updatedData.queueNumber}`;
        })
        .catch(error => {
            console.error('Error sending customer data:', error);
            // alert(`Failed to send customer data. Please try again later. Error: ${error.message}`);
        });
}


// Start countdown and initialize page content
document.addEventListener('DOMContentLoaded', function() {
    setInnerTexts();

    $("#timestamp-text").hide();

    if (queueID) {
        sendCustomerData();
        // appendQueueID();
    } else {
        console.error("No queue ID provided in the URL!");
    }
    });