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

    function handleEnter() {
        if (waitingForContinue) {
            window.location.href = 'index.html';
            return;
        }
        
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
            }, 2000); // Small delay to let first message be read
        } else if (userInput === 'no') {
            // Hide input line
            document.getElementById('input-line').style.display = 'none';
            
            // Show friendly message
            const noMessage = `The commons belong to everyone.
This game is open, collaborative, and free.
All are welcome to participate in their own way.

press enter to continue`;
            
            output.textContent = noMessage;
            output.classList.add('show');
            waitingForContinue = true;
        } else {
            // Clear input on any other response
            input.value = '';
        }
    }

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleEnter();
        }
    });
    
    // Also listen for Enter key on document when waiting for continue
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && waitingForContinue) {
            e.preventDefault();
            window.location.href = 'index.html';
        }
    });
    
    // Keep focus on input
    input.addEventListener('blur', function() {
        if (!waitingForContinue) {
            input.focus();
        }
    });
});

