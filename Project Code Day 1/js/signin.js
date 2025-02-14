document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signin-form');
    const googleSignin = document.querySelector('.google-signin');
    const errorMessage = document.getElementById('error-message');

    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userInput = document.getElementById('user-input').value;
        const password = document.getElementById('password').value;

        try {
            // Check for admin credentials
            if ((userInput.toLowerCase() === 'admin@recspicy.com' || userInput.toLowerCase() === 'admin') 
                && password === 'admin123') {
                // Store admin token
                localStorage.setItem('adminToken', 'admin-session-token');
                localStorage.setItem('userRole', 'admin');
                
                // Redirect to admin page
                window.location.href = 'admin.html';
                return;
            }

            // Regular user authentication
            const response = await mockAuthenticateUser(userInput, password);
            
            if (response.success) {
                // Store user token
                localStorage.setItem('userToken', response.token);
                localStorage.setItem('userRole', 'user');
                
                // Redirect to profile page
                window.location.href = 'profile.html';
            } else {
                showError('Invalid username/email or password');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            showError('An error occurred during sign in');
        }
    });

    googleSignin.addEventListener('click', () => {
        // Implement Google OAuth when ready
        alert('Google sign in will be implemented soon!');
    });

    // Check if user should be remembered
    if (localStorage.getItem('rememberUser') && localStorage.getItem('userToken')) {
        window.location.href = 'respicy-index.html';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});

// Update navigation.js to handle sign out
function signOut() {
    // Clear all authentication tokens
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    
    // Redirect to landing page
    window.location.href = 'landing.html';
}

// Mock authentication function
async function mockAuthenticateUser(userInput, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if input is email or username
    const isEmail = userInput.includes('@');
    
    // In a real implementation, you would validate against a database
    // For demo purposes, we'll accept any input
    return {
        success: true,
        token: 'mock-user-token',
        user: {
            id: '123',
            username: isEmail ? userInput.split('@')[0] : userInput,
            email: isEmail ? userInput : `${userInput}@example.com`
        }
    };
} 