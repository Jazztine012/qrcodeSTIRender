let adminLoginPath = "../html/login.html";
let loginForm = document.getElementById('loginForm');
let passwordTextInput = document.getElementById('accountPassword');

document.addEventListener('DOMContentLoaded', function() {
    resetForm();
    togglePasswordVisibility();
});

function resetForm() {
    loginForm.reset(); // Reset form fields
    passwordTextInput.focus(); // Refocus on the password field
    console.log("Form was reset.")
}

// Switch to Live Queue Display
function switchToAdminLogin(event) {
    console.log("Go to admin login mode");
    window.location.href = adminLoginPath;
} 

// Toggle for seeing password
function togglePasswordVisibility(){
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('accountPassword');
    
    togglePassword.addEventListener('click', function() {
        // Toggle the type attribute
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        
        // Toggle the eye icon
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });
}

// Handle login submission
async function loginUser(event) {
    event.preventDefault();
    
    const queueDisplayPath = "../queue_display_module/public/index.html"; 
    const inputQueueDisplayPassword = passwordTextInput.value;

    try {
        // Send login request
        const response = await fetch('verify_login_queue_display.php', {
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
            passwordTextInput.value = ""; // Empties password text input
            alert(data.message); // Show error message
        }
    } catch (error) {
        console.error('Error:', error);
    }
}