document.addEventListener('DOMContentLoaded', () => 
{
    const signinForm = document.getElementById('signin-form');
    const googleSignin = document.querySelector('.google-signin');
    const errorMessage = document.getElementById('error-message');

    signinForm.addEventListener('submit', async (e) => 
	{
        e.preventDefault();
        
        const userInput = document.getElementById('user-input').value;
        const password = document.getElementById('password').value;

        try 
		{
            if ((userInput.toLowerCase() === 'admin@recspicy.com' || userInput.toLowerCase() === 'admin') 
                && password === 'admin123') {

                localStorage.setItem('adminToken', 'admin-session-token');
                localStorage.setItem('userRole', 'admin');
                window.location.href = 'admin.html';
                return;
            }

            const response = await mockAuthenticateUser(userInput, password);
            
            if (response.success) 
			{
                localStorage.setItem('userToken', response.token);
                localStorage.setItem('userRole', 'user');
                window.location.href = 'profile.html';
            } else 
			{
                showError('Invalid username/email or password');
            }
        } catch (error) 
		{
            console.error('Authentication error:', error);
            showError('An error occurred during sign in');
        }
    });





    googleSignin.addEventListener('click', () => 
	{
        // Implement Google OAuth
        alert('Google sign in will be implemented soon!');
    });

    // remember user
    if (localStorage.getItem('rememberUser') && localStorage.getItem('userToken')) {
        window.location.href = 'respicy-index.html';
    }

    function showError(message) 
	{
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
	});



function signOut() 
{
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
	
    localStorage.removeItem('userRole');
    window.location.href = 'landing.html';
}



// Mock authentication
async function mockAuthenticateUser(userInput, password) 
{
    const isEmail = userInput.includes('@');
    
    // validate against a database
    // For rn we will accept any input
    return 
	{
        success: true,
        token: 'mock-user-token',
        user: 
		{
            id: '123',
            username: isEmail ? userInput.split('@')[0] : userInput,
            email: isEmail ? userInput : `${userInput}@exampleemail.com`
        }
    };
}

signupForm.addEventListener('submit', async (e) => 
{
    e.preventDefault();
    
    const formData = 
	{
        first_name: document.getElementById('first-name').value,
        last_name: document.getElementById('last-name').value,
		
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };



    try 
	{
        const response = await fetch('/api/auth/signup', 
		{
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) 
		{
            localStorage.setItem('authToken', data.token);
            window.location.href = '/profile.html';
        } 
		else 
		{
            showError(data.error || 'Signup failed');
        }
    } 
	catch (error) 
	{
        showError('Network error. Please try again.');
    }
});