document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('output');
    const cursor = document.querySelector('.cursor');
    let waitingForContinue = false;
    
    const responseText = `This is the beginning of a decade-long game that slowly becomes a real village.
Join the commoners as we shape the future of our valley together.

You can:
Propose a tool.
Add a rule.
Name a place.
Create a quest.
Document a path.
Bind myth to reality.

The Valley of the Commons.
A commons game for commoners.`;

    function processInput() {
        const userInput = input.value.trim().toLowerCase();
        
        if (userInput === 'yes') {
            // Hide input line
            document.getElementById('input-line').style.display = 'none';
            
            // Show output
            output.textContent = responseText;
            output.classList.add('show');
            
            // After showing the message, append second message at bottom
            setTimeout(function() {
                const secondMessage = '\n\ncommoning soon on github\n\npress enter to continue';
                output.textContent = responseText + secondMessage;
                waitingForContinue = true;
            }, 10000); // Wait 10 seconds before showing "press enter to continue"
        } else if (userInput === 'no') {
            // Hide input line
            document.getElementById('input-line').style.display = 'none';
            
            // Show friendly message and wait for user to press enter
            const noMessage = `The commons belong to everyone.
This game is open, collaborative, and free.
All are welcome to participate in their own way.

press enter to continue`;
            
            output.textContent = noMessage;
            output.classList.add('show');
            waitingForContinue = true; // Wait for user to press enter before redirecting
        } else {
            // Clear input on any other response
            input.value = '';
        }
    }

    function handleEnter(e) {
        if (e) {
            e.preventDefault();
        }
        
        if (waitingForContinue) {
            // Redirect to homepage
            window.location.href = 'index.html';
            return;
        }
        
        // Process the user's input
        processInput();
    }

    // Listen for Enter key on input
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            handleEnter(e);
        }
    });
    
    // Also listen for Enter key on document (for when input is hidden)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            handleEnter(e);
        }
    });
    
    // Keep focus on input when not waiting for continue
    input.addEventListener('blur', function() {
        if (!waitingForContinue) {
            input.focus();
        }
    });
});
