document.addEventListener('DOMContentLoaded', () => 
{
    const signupForm = document.getElementById('signup-form');
    const googleSignup = document.querySelector('.google-signup');
    const inputs = signupForm.querySelectorAll('.form-input');
    const submitButton = signupForm.querySelector('.signup-button');

// if you dont understand, lmk i will explain 
    const patterns = 
	{
        username: /^[a-zA-Z0-9_]{3,20}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        password: /^.{8,}$/
    };

    inputs.forEach(input => 
	{
        input.addEventListener('input', () => 
		{
            validateInput(input);
            checkFormValidity();
        });

        input.addEventListener('blur', () => 
		{
            validateInput(input);
        });
    });

    function validateInput(input) 
	{
        const errorMessage = input.nextElementSibling;
        let isValid = true;

        input.classList.remove('error');
        errorMessage.classList.remove('visible');

        switch(input.id) 
		{
            case 'first-name':
			
            case 'last-name':
                isValid = input.value.trim().length > 0;
                break;
				
            case 'username':
                isValid = patterns.username.test(input.value);
                break;
				
            case 'email':
                isValid = patterns.email.test(input.value);
                break;
				
            case 'password':
                isValid = patterns.password.test(input.value);
                break;
				
            case 'confirm-password':
                const password = document.getElementById('password').value;
                isValid = input.value === password;
                break;
        }

        if (!isValid && input.value) 
		{
            input.classList.add('error');
            errorMessage.classList.add('visible');
        }

        return isValid;
    }





    function checkFormValidity() 
	{
        const allInputsValid = Array.from(inputs).every(input => validateInput(input));
        const termsAgreed = document.getElementById('terms-agree').checked;
        submitButton.disabled = !(allInputsValid && termsAgreed);
    }


    signupForm.addEventListener('submit', async (e) => 
	{
        e.preventDefault();

        if (!signupForm.checkValidity() || !Array.from(inputs).every(input => validateInput(input))) 
		{
            return;
        }

        const formData = 
		{
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
			
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
			
            password: document.getElementById('password').value
        };

        try 
		{
            console.log('Sign up data:', formData);
            localStorage.setItem('userToken', 'demo-token');
            window.location.href = 'respicy-index.html';
        } 
		catch (error) 
		{
            console.error('Error during signup:', error);
            alert('Failed to create account. Please try again.');
        }
    });



    // Handle Google
    googleSignup.addEventListener('click', () => 
	{
        // Implement Google OAuth
        alert('Google sign up will be implemented soon!');
    });
	
	// T&C checkbox
    document.getElementById('terms-agree').addEventListener('change', checkFormValidity);
}); 