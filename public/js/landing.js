document.addEventListener('DOMContentLoaded', () => {
    const signInBtn = document.getElementById('signin-btn');
    const signUpBtn = document.getElementById('signup-btn');

    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            window.location.href = 'signin.html';
        });
    }

    if (signUpBtn) {
        signUpBtn.addEventListener('click', () => {
            window.location.href = 'signup.html';
        });
    }
});
