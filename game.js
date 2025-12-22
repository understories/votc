// Game Terminal Chat Interface
// Implements Socratic game master moderator with text streaming

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('output');
    const cursor = document.querySelector('.cursor');
    
    let messageHistory = [];
    let turnCount = 0;
    const MAX_TURNS = 12;

    // Update initial question to welcome message
    const questionLine = document.querySelector('.question');
    if (questionLine) {
        questionLine.textContent = 'Welcome to the Valley. What would you like to explore?';
    }

    async function sendMessage(userInput) {
        // Check turn limit
        if (turnCount >= MAX_TURNS) {
            displayMessage('system', 'Conversation limit reached. The game master has stepped away.');
            return;
        }

        // Add user message to history
        messageHistory.push({ role: 'user', content: userInput });
        turnCount++;
        
        // Display user message
        displayMessage('user', userInput);
        
        // Show loading indicator
        showLoadingIndicator('AI is thinking...');
        
        try {
            const response = await fetch('/api/game-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: messageHistory })
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: `API error: ${response.status}` }));
                throw new Error(error.error || `API error: ${response.status}`);
            }

            // Text stream (simple: just append chunks)
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiMessage = '';
            
            // Create streaming message element
            const streamingElement = createStreamingMessageElement();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // Decode chunk and append directly (text stream, no parsing needed)
                const chunk = decoder.decode(value, { stream: true });
                aiMessage += chunk;
                
                // Update UI (typewriter effect)
                updateStreamingMessage(streamingElement, aiMessage);
            }
            
            // Finalize streaming element
            finalizeStreamingMessage(streamingElement);
            
            // Add to history
            messageHistory.push({ role: 'assistant', content: aiMessage });
            hideLoadingIndicator();
            
            // Check if approaching limit
            if (turnCount >= MAX_TURNS - 2) {
                displayMessage('system', `[${MAX_TURNS - turnCount} exchanges remaining]`);
            }
            
        } catch (error) {
            displayError('Connection error. Please try again.');
            hideLoadingIndicator();
            console.error('Chat error:', error);
        }
    }

    function displayMessage(role, content) {
        const output = document.getElementById('output');
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = role === 'user' ? '>' : '$';
        
        const text = document.createElement('span');
        text.className = role === 'user' ? 'user-message' : 'ai-message';
        text.textContent = content;
        
        line.appendChild(prompt);
        line.appendChild(text);
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    function createStreamingMessageElement() {
        const output = document.getElementById('output');
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = '$';
        
        const text = document.createElement('span');
        text.className = 'ai-message ai-message-streaming';
        text.textContent = '';
        
        line.appendChild(prompt);
        line.appendChild(text);
        output.appendChild(line);
        
        return text;
    }

    function updateStreamingMessage(element, content) {
        element.textContent = content;
        const output = document.getElementById('output');
        output.scrollTop = output.scrollHeight;
    }

    function finalizeStreamingMessage(element) {
        element.classList.remove('ai-message-streaming');
    }

    function showLoadingIndicator(message) {
        const output = document.getElementById('output');
        const indicator = document.createElement('div');
        indicator.className = 'terminal-line loading-indicator';
        indicator.id = 'loading-indicator';
        
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = '$';
        
        const text = document.createElement('span');
        text.className = 'loading-text';
        text.textContent = message;
        
        indicator.appendChild(prompt);
        indicator.appendChild(text);
        output.appendChild(indicator);
        output.scrollTop = output.scrollHeight;
    }

    function hideLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function displayError(message) {
        const output = document.getElementById('output');
        const line = document.createElement('div');
        line.className = 'terminal-line error-message';
        
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = '!';
        prompt.style.color = '#ff4444';
        
        const text = document.createElement('span');
        text.className = 'error-text';
        text.textContent = message;
        text.style.color = '#ff4444';
        
        line.appendChild(prompt);
        line.appendChild(text);
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    // Handle Enter key
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const userInput = input.value.trim();
            if (userInput) {
                sendMessage(userInput);
                input.value = '';
            }
        }
    });
    
    // Keep focus on input
    input.addEventListener('blur', function() {
        if (turnCount < MAX_TURNS) {
            input.focus();
        }
    });
});
