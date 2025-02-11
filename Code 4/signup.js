document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value,
        email: document.getElementById('email').value,
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirm-password').value
    };

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Validate username format (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(formData.username)) {
        alert('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
        return;
    }

    // For now, just log the data
    console.log('Sign up data:', formData);
    // In real implementation, this would make an API call
}); 