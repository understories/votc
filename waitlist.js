// Smooth scroll to section, centered on page
function scrollToSection(sectionId, e) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    e.preventDefault();
    
    // Get header height for offset
    const header = document.querySelector('.header');
    const headerHeight = header ? header.offsetHeight : 0;
    const offset = headerHeight + 20; // Add extra padding for visibility
    
    // Calculate position to center the section in viewport
    const sectionRect = section.getBoundingClientRect();
    const sectionTop = sectionRect.top + window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const sectionHeight = sectionRect.height;
    
    // Calculate scroll position to center the section, accounting for header
    // Ensure the title is visible by adjusting the offset
    const scrollPosition = sectionTop - offset - (viewportHeight / 2) + (sectionHeight / 2);
    
    // Smooth scroll to centered position
    window.scrollTo({
        top: Math.max(0, scrollPosition), // Ensure we don't scroll to negative position
        behavior: 'smooth'
    });
}

// Smooth scroll to waitlist section, centered on page
function scrollToWaitlist(e) {
    scrollToSection('waitlist', e);
}

// Waitlist form submission handler and scroll setup
document.addEventListener('DOMContentLoaded', function() {
    // Set up scroll handlers for all anchor links
    const waitlistLinks = document.querySelectorAll('a[href="#waitlist"]');
    waitlistLinks.forEach(link => {
        link.addEventListener('click', scrollToWaitlist);
    });
    
    const scheduleLinks = document.querySelectorAll('a[href="#schedule"]');
    scheduleLinks.forEach(link => {
        link.addEventListener('click', (e) => scrollToSection('schedule', e));
    });
    
    const form = document.getElementById('waitlist-form');
    const emailInput = document.getElementById('waitlist-email');
    const nameInput = document.getElementById('waitlist-name');
    const messageDiv = document.getElementById('waitlist-message');
    const submitButton = form.querySelector('button[type="submit"]');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Disable form during submission
        submitButton.disabled = true;
        submitButton.textContent = 'Joining...';
        messageDiv.textContent = '';
        messageDiv.className = 'waitlist-message';

        const email = emailInput.value.trim();
        const name = nameInput.value.trim();

        // Basic email validation
        if (!email || !email.includes('@')) {
            showMessage('Please enter a valid email address.', 'error');
            submitButton.disabled = false;
            submitButton.textContent = 'Join Waitlist';
            return;
        }

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, name }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showMessage('Thank you! You\'ve been added to the waitlist.', 'success');
                form.reset();
            } else {
                showMessage(data.error || 'Something went wrong. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Join Waitlist';
        }
    });

    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `waitlist-message ${type}`;
        
        // Scroll message into view if needed
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

