document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => 
	{
        anchor.addEventListener('click', function (e) 
		{
            e.preventDefault();
            
			document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const signInBtn = document.getElementById('signin-btn');
    const signUpBtn = document.getElementById('signup-btn');

    signInBtn.addEventListener('click', () => 
	{
        window.location.href = '../pages/signin.html';
    });

    signUpBtn.addEventListener('click', () => 
	{
        window.location.href = '../pages/signup.html';
    });
}); 