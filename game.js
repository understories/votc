document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('output');
    const cursor = document.querySelector('.cursor');
    
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

    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const userInput = input.value.trim().toLowerCase();
            
            if (userInput === 'yes') {
                // Hide input line
                document.getElementById('input-line').style.display = 'none';
                
                // Show output
                output.textContent = responseText;
                output.classList.add('show');
                
                // After showing the message, append second message at bottom, then redirect
                setTimeout(function() {
                    const secondMessage = '\n\ncommoning soon on github';
                    output.textContent = responseText + secondMessage;
                    setTimeout(function() {
                        window.location.href = 'index.html';
                    }, 20000);
                }, 2000); // Small delay to let first message be read
            } else if (userInput === 'no') {
                // Hide input line
                document.getElementById('input-line').style.display = 'none';
                
                // Show friendly message
                const noMessage = `The commons belong to everyone.
This game is open, collaborative, and free.
All are welcome to participate in their own way.

Returning to the valley...`;
                
                output.textContent = noMessage;
                output.classList.add('show');
                
                // Redirect to homepage after a delay
                setTimeout(function() {
                    window.location.href = 'index.html';
                }, 20000);
            } else {
                // Clear input on any other response
                input.value = '';
            }
        }
    });
    
    // Keep focus on input
    input.addEventListener('blur', function() {
        input.focus();
    });
});

