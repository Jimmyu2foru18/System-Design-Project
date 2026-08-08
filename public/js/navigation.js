document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    highlightCurrentPage();
    updateAuthUI();
    fetchUserCount();
});

function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.navbar') && navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
        
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
}

function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.nav-links a, .navbar a');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            item.classList.add('active');
        }
    });
}

function isLoggedIn() {
    return !!(localStorage.getItem('userId') || localStorage.getItem('authToken') || localStorage.getItem('userToken'));
}

function updateAuthUI() {
    const userActions = document.getElementById('user-actions');
    if (!userActions) return;
    
    if (isLoggedIn()) {
        userActions.innerHTML = `
            <a href="profile.html" class="profile-link">My Profile</a>
            <button onclick="handleSignOut()" class="btn btn-outline btn-sm">Sign Out</button>
        `;
    } else {
        userActions.innerHTML = `
            <a href="signin.html" class="profile-link">Sign In</a>
            <a href="signup.html" class="btn btn-secondary btn-sm">Sign Up</a>
        `;
    }
}

function handleSignOut() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('rememberUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userRole');
    window.location.href = 'index.html';
}

function fetchUserCount() {
    fetch('/api/users/count/total')
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(data => {
            const userCountElement = document.getElementById('user-count');
            if (userCountElement && data.count !== undefined) {
                userCountElement.textContent = `Users: ${data.count}`;
            }
        })
        .catch(error => {
            console.error('Error fetching user count:', error);
            const userCountElement = document.getElementById('user-count');
            if (userCountElement) {
                userCountElement.textContent = 'Users: N/A';
            }
        });
}
