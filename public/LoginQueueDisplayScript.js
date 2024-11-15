let adminLoginPath = "http://localhost/queue_management/html/login.html";
let loginForm = document.getElementById('loginForm');
let passwordTextInput = document.getElementById('accountPassword');

document.addEventListener('DOMContentLoaded', function() {
    resetForm();
    setupPasswordToggle();
});

function resetForm() {
    loginForm.reset(); // Reset form fields
    passwordTextInput.focus(); // Refocus on the password field
    console.log("Form was reset.");
}

// Switch to Admin Login
function switchToAdminLogin(event) {
    console.log("Go to admin login mode");
    window.location.href = adminLoginPath;
} 

// Setup toggle for seeing password
function setupPasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    
    togglePassword.addEventListener('click', function() {
        // Toggle the type attribute of the password field
        const type = passwordTextInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordTextInput.setAttribute('type', type);
        
        // Toggle the eye icon
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });
}

// Handle login submission
async function loginUser(event) {
    event.preventDefault();
    
    const queueDisplayPath = "https://qrcodesti.onrender.com/queue_display.html"; 
    const inputQueueDisplayPassword = passwordTextInput.value;
    const verifyLoginScript = 'https://qrcodesti.onrender.com/verify_login_queue_display.php';

    try {
        // Send login request
        const response = await fetch(verifyLoginScript, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                queue_display_password: inputQueueDisplayPassword
            }),
        });

        // Parse response JSON
        const data = await response.json();

        if (data.status === 'success') {
            alert(data.message);
            window.location.href = queueDisplayPath; // Redirect on success
        } else {
            passwordTextInput.value = ""; // Clear password input
            alert(data.message); // Show error message
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
