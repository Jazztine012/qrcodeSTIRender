// Global Script that all HTML documents has access to.

// let accountNumber;
// let accountName;
// // admin = 1; staff = 0;
// let accountType;
// let queueSkipWaitTime;

document.addEventListener('DOMContentLoaded', function () {
    // Load the navigation bar placeholder
    
    $("#nav-placeholder").load("nav.html");
    $('[data-toggle="tooltip"]').tooltip(); // Initialize tooltips

    // Loading instantiation
    $("#loading-placeholder").load("loading.html");
    hideLoadingOverlay();
});

function resetValues() {
    $.remove
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', () => {
        input.classList.add('focused'); // Optional: Add a class for styling when focused
    });
    input.addEventListener('blur', () => {
        input.classList.remove('focused'); // Remove the class when not focused
    });
});

// Happens during a successful login.
// Found in LoginScript.js
// function setGlobals(accNum, accName, accType, skipWait) {
//     accountNumber = accNum;
//     accountName = accName;
//     accountType = accType;
//     queueSkipWaitTime = skipWait;

//     // TEST SCRIPT
//     if (accountNumber != 0) {
//         console.log("Fetch successful.");
//         console.log(`${accountNumber}, ${accountName}, ${accountType}, ${queueSkipWaitTime}`);
//     }
//     else {
//         console.log("Fetch unsuccessful.");
//     }
// }

// Resets values to default.
// Called upon logout function
function resetGlobals() {
    localStorage.setItem('currentAccountID', null);
    localStorage.setItem('currentAccountName', null);
    localStorage.setItem('currentAccountType', null);
    localStorage.setItem('currentQueueSkipWaitTime', null);

    console.log("Global values reset.");
    console.log("Account Information Changed:",
        localStorage.getItem('currentAccountID'),
        localStorage.getItem('currentAccountName'),
        localStorage.getItem('currentAccountType'),
        localStorage.getItem('currentQueueSkipWaitTime'));
}

// Function for encapsulation
// function getAccountNumber() {
//     console.log(`Account number returned. Account number is: ${this.accountNumber}`);
//     return accountNumber;
// }

// Shows loading overlay. Called by functions in certain pages
function showLoadingOverlay() {
    document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoadingOverlay() {
    document.getElementById("loadingOverlay").style.display = "none";
}
