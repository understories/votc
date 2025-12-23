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

    // Initial question is set in HTML
    // After first response, Socratic game master moderator takes over

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
                const errorText = await response.text().catch(() => '');
                let error;
                try {
                    error = JSON.parse(errorText);
                } catch {
                    error = { error: errorText || `API error: ${response.status}` };
                }
                throw new Error(error.error || `API error: ${response.status}`);
            }

            // Check if response body exists
            if (!response.body) {
                throw new Error('No response body received');
            }

            // Text stream (simple: just append chunks)
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiMessage = '';
            
            // Create streaming message element
            const streamingElement = createStreamingMessageElement();
            
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        console.log('[game] Stream complete, received', aiMessage.length, 'characters');
                        break;
                    }
                    
                    // Decode chunk and append directly (text stream, no parsing needed)
                    const chunk = decoder.decode(value, { stream: true });
                    if (chunk) {
                        aiMessage += chunk;
                        // Update UI (typewriter effect)
                        updateStreamingMessage(streamingElement, aiMessage);
                    }
                }
            } catch (streamError) {
                console.error('[game] Stream reading error:', streamError);
                throw streamError;
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
        // Add dataset attributes for message selection
        const line = element.closest('.terminal-line');
        if (line) {
            line.classList.add('message-line');
            line.dataset.role = 'assistant';
            line.dataset.content = element.textContent;
            // Add click handler for selection
            line.addEventListener('click', function() {
                selectMessage(line, 'assistant', element.textContent);
            });
        }
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
        // Remove existing buttons if any
        hideShareButton();
        
        const output = document.getElementById('output');
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'share-buttons-container';
        buttonContainer.className = 'share-buttons-container';
        
        // Default account button (uses API)
        const defaultButton = document.createElement('button');
        defaultButton.id = 'share-default-btn';
        defaultButton.className = 'share-button share-button-default';
        defaultButton.textContent = 'share on github repo (default account)';
        defaultButton.addEventListener('click', () => shareToGitHub('default'));
        
        // Own account button (redirects to GitHub)
        const ownButton = document.createElement('button');
        ownButton.id = 'share-own-btn';
        ownButton.className = 'share-button share-button-own';
        ownButton.textContent = 'share on github repo (my account)';
        ownButton.addEventListener('click', () => shareToGitHub('own'));
        
        buttonContainer.appendChild(defaultButton);
        buttonContainer.appendChild(ownButton);
        output.appendChild(buttonContainer);
    }

    function hideShareButton() {
        const container = document.getElementById('share-buttons-container');
        if (container) {
            container.remove();
        }
    }

    async function shareToGitHub(method) {
        if (!selectedText || selectedMessages.length === 0) {
            displayError('No text selected');
            return;
        }

        if (method === 'own') {
            // Redirect to GitHub to create issue or file with user's account
            shareWithOwnAccount();
            return;
        }

        // Default: Use API with default account
        const defaultButton = document.getElementById('share-default-btn');
        const ownButton = document.getElementById('share-own-btn');
        
        if (defaultButton) {
            defaultButton.disabled = true;
            defaultButton.textContent = 'Sharing...';
        }
        if (ownButton) {
            ownButton.disabled = true;
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
            if (defaultButton) {
                defaultButton.disabled = false;
                defaultButton.textContent = 'share on github repo (default account)';
            }
            if (ownButton) {
                ownButton.disabled = false;
            }
        }
    }

    function shareWithOwnAccount() {
        // Generate file content template
        const timestamp = new Date().toISOString();
        const date = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        const filename = `idea-${new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '-')}.md`;
        const fileContent = `# Idea: [Auto-generated from conversation]

**Source:** Valley of the Commons Game Master Dialogue  
**Date:** ${date}  
**Excerpt:**

${selectedText}

---

**Context:** This idea emerged from a Socratic dialogue about game design in the Valley of the Commons.

**Next Steps:**
- [ ] Refine this idea
- [ ] Connect to other ideas
- [ ] Propose as a tool/rule/quest

---

*Generated from game master conversation*`;

        // Encode content for URL (base64 or use GitHub's issue creation)
        // Option 1: Create GitHub issue with the content
        const issueTitle = encodeURIComponent(`Idea: ${selectedText.slice(0, 50)}...`);
        const issueBody = encodeURIComponent(`This idea was generated from a game master conversation.\n\n## Excerpt\n\n${selectedText}\n\n## File Content\n\nTo add this as a file in \`build_game/ideas/\`, use this content:\n\n\`\`\`markdown\n${fileContent}\n\`\`\`\n\n**Suggested filename:** \`${filename}\`\n\n---\n\n*You can copy the markdown above and create a new file in the repo, or convert this issue to a pull request.*`);
        
        const owner = 'understories';
        const repo = 'votc';
        const issueUrl = `https://github.com/${owner}/${repo}/issues/new?title=${issueTitle}&body=${issueBody}&labels=idea,game-design`;
        
        // Open in new tab
        window.open(issueUrl, '_blank', 'noopener,noreferrer');
        
        // Show message
        displayMessage('system', 'Opened GitHub in new tab. Create an issue, then you can convert it to a PR or add the file directly.');
        
        // Clear selection after a delay
        setTimeout(() => {
            clearSelection();
        }, 2000);
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
