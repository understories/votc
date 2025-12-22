// Game Terminal Chat Interface
// Implements Socratic game master moderator with text streaming

document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('terminal-input');
    const output = document.getElementById('output');
    const cursor = document.querySelector('.cursor');
    
    let messageHistory = [];
    let turnCount = 0;
    const MAX_TURNS = 12;
    let selectedText = null;
    let selectedMessages = [];

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
        line.className = 'terminal-line message-line';
        line.dataset.role = role;
        line.dataset.content = content;
        
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
        
        // Add click handler for selection
        line.addEventListener('click', function() {
            selectMessage(line, role, content);
        });
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

    // Text selection functionality
    function selectMessage(line, role, content) {
        // Clear previous selection
        clearSelection();
        
        // Select this message
        line.classList.add('selected');
        selectedText = `${role === 'user' ? '>' : '$'} ${content}`;
        selectedMessages = [{ role, content }];
        
        // Show share button
        showShareButton();
    }

    function clearSelection() {
        document.querySelectorAll('.message-line.selected').forEach(line => {
            line.classList.remove('selected');
        });
        selectedText = null;
        selectedMessages = [];
        hideShareButton();
    }

    function showShareButton() {
        // Remove existing button if any
        hideShareButton();
        
        const button = document.createElement('button');
        button.id = 'share-to-github-btn';
        button.className = 'share-button';
        button.textContent = 'Share to GitHub';
        button.addEventListener('click', shareToGitHub);
        
        const output = document.getElementById('output');
        output.appendChild(button);
    }

    function hideShareButton() {
        const button = document.getElementById('share-to-github-btn');
        if (button) {
            button.remove();
        }
    }

    async function shareToGitHub() {
        if (!selectedText || selectedMessages.length === 0) {
            displayError('No text selected');
            return;
        }

        const button = document.getElementById('share-to-github-btn');
        if (button) {
            button.disabled = true;
            button.textContent = 'Sharing...';
        }

        try {
            const response = await fetch('/api/share-to-github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    excerpt: selectedText,
                    context: {
                        messages: selectedMessages,
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to share');
            }

            // Show success message
            displaySuccess(data.url, data.filename);
            
            // Clear selection
            clearSelection();

        } catch (error) {
            displayError(`Failed to share: ${error.message}`);
            if (button) {
                button.disabled = false;
                button.textContent = 'Share to GitHub';
            }
        }
    }

    function displaySuccess(url, filename) {
        const output = document.getElementById('output');
        const line = document.createElement('div');
        line.className = 'terminal-line success-message';
        
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = '✓';
        prompt.style.color = '#00ff00';
        
        const text = document.createElement('span');
        text.className = 'success-text';
        text.innerHTML = `Shared! <a href="${url}" target="_blank" rel="noopener" style="color: #00ff00; text-decoration: underline;">View on GitHub</a>`;
        text.style.color = '#00ff00';
        
        line.appendChild(prompt);
        line.appendChild(text);
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            line.remove();
        }, 5000);
    }

    // Click outside to deselect
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.message-line') && !e.target.closest('.share-button')) {
            clearSelection();
        }
    });
});
