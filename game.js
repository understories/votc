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

