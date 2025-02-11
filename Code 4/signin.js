// Add admin authentication to signin.js
document.getElementById('signin-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userInput = document.getElementById('user-input').value;
    const password = document.getElementById('password').value;

    try {
        // Check for admin credentials
        if (userInput === 'admin' && password === 'pass1234!') {
            window.location.href = 'admin.html';
            return;
        }

        const user = await AuthService.signIn(userInput, password);
        if (user) {
            // Connect WebSocket after successful login
            WebSocketService.connect();
            window.location.href = 'profile.html';
        }
    } catch (error) {
        alert('Invalid credentials. Please try again.');
    }
}); 