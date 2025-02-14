document.addEventListener('DOMContentLoaded', () => {
    // Handle navigation scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Handle sign in/sign up buttons
    const signInBtn = document.getElementById('signin-btn');
    const signUpBtn = document.getElementById('signup-btn');

    signInBtn.addEventListener('click', () => {
        // Always redirect to signin page first
        window.location.href = '../pages/signin.html';
    });

    signUpBtn.addEventListener('click', () => {
        window.location.href = '../pages/signup.html';
    });
}); 