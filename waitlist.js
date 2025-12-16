// Waitlist form submission handler
document.addEventListener('DOMContentLoaded', function() {
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

