document.addEventListener('DOMContentLoaded', () => {
    console.log('SignIn page loaded');
    const form = document.getElementById('signin-form');
    if (form) {
        form.addEventListener('submit', handleSignIn);
    } else {
        console.error('Sign-in form not found');
    }
    
    const googleSignInButton = document.querySelector('.btn-google');
    if (googleSignInButton) {
        googleSignInButton.addEventListener('click', handleGoogleSignIn);
    }

    // One-click demo credential fill buttons
    document.querySelectorAll('.cred-fill').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.cred-item');
            if (!item) return;
            const email = item.dataset.email;
            const pass = item.dataset.pass;
            const userInput = document.getElementById('user-input');
            const password = document.getElementById('password');
            if (userInput) userInput.value = email;
            if (password) password.value = pass;
        });
    });
});

function getRedirectUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    return redirect && redirect !== 'signin.html' ? redirect : 'profile.html';
}

async function handleGoogleSignIn() {
    try {
        const client = google.accounts.oauth2.initTokenClient({
            client_id: window.RECSPICY_CONFIG.GOOGLE_CLIENT_ID,
            scope: 'profile email',
            callback: async (response) => {
                if (response.access_token) {
                    const res = await fetch('/api/users/google-auth', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: response.access_token })
                    });
                    
                    const userData = await res.json();
                    
                    if (res.ok) {
                        localStorage.setItem('userId', userData._id);
                        localStorage.setItem('userName', userData.name);
                        localStorage.setItem('username', userData.username);
                        localStorage.setItem('authToken', userData.token);
                        window.location.href = getRedirectUrl();
                    } else {
                        throw new Error(userData.message || 'Google authentication failed');
                    }
                }
            }
        });
        
        client.requestAccessToken();
    } catch (error) {
        console.error('Google sign-in error:', error);
        showError('Google sign-in failed: ' + error.message);
    }
}

async function handleSignIn(event) {
    event.preventDefault();
    console.log('Sign-in attempt started');
    
    const errorEl = document.getElementById('signin-error');
    if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
    }

    const userInput = document.getElementById('user-input').value.trim();
    const password = document.getElementById('password').value;
    const email = userInput.toLowerCase();
    
    if (!userInput || !password) {
        showError('Please fill in all fields');
        return;
    }

    // Check for admin login
    if (userInput === 'admin' && password === 'admin1') {
        console.log('Admin login successful');
        localStorage.setItem('userId', 'admin');
        localStorage.setItem('userName', 'Administrator');
        localStorage.setItem('username', 'admin');
        localStorage.setItem('authToken', 'admin-token');
        localStorage.setItem('adminToken', 'admin-token');
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('isAdmin', 'true');
        window.location.href = 'admin.html';
        return;
    }
    
    try {
        console.log('Sending login request...');
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                [email.includes('@') ? 'email' : 'username']: email,
                password
            })
        });
        
        if (!response.ok) {
            throw new Error('Login failed');
        }
        
        const userData = await response.json();
        console.log('Login successful, user data received');
        
        // Store user data in localStorage
        localStorage.setItem('userId', userData._id);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('username', userData.username);
        localStorage.setItem('authToken', userData.token || 'dummy-token');
        
        console.log('Redirecting to profile page...');
        window.location.href = getRedirectUrl();
    } catch (error) {
        console.error('Login error:', error);
        showError('Invalid username/email or password');
    }
}

function showError(message) {
    console.error('Error:', message);
    const errorEl = document.getElementById('signin-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    } else {
        alert(message);
    }
}