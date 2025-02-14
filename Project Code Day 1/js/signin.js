document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signin-form');
    const googleSignin = document.querySelector('.google-signin');
    const errorMessage = document.getElementById('error-message');

    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userInput = document.getElementById('user-input').value;
        const password = document.getElementById('password').value;

        try {
            if ((userInput.toLowerCase() === 'admin@recspicy.com' || userInput.toLowerCase() === 'admin') 
                && password === 'admin123') {
                localStorage.setItem('adminToken', 'admin-session-token');
                localStorage.setItem('userRole', 'admin');
                window.location.href = 'admin.html';
                return;
            }
            const response = await mockAuthenticateUser(userInput, password);
            
            if (response.success) {
                localStorage.setItem('userToken', response.token);
                localStorage.setItem('userRole', 'user');
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
        alert('Google sign in will be implemented soon!');
    });

    if (localStorage.getItem('rememberUser') && localStorage.getItem('userToken')) {
        window.location.href = 'respicy-index.html';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});

function signOut() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    window.location.href = 'landing.html';
}

async function mockAuthenticateUser(userInput, password) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const isEmail = userInput.includes('@');

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
