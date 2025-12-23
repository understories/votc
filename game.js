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
                console.error('[game] No response body received');
                throw new Error('No response body received');
            }

            console.log('[game] Response received, starting to read stream');
            
            // Text stream (simple: just append chunks)
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiMessage = '';
            
            // Create streaming message element
            const streamingElement = createStreamingMessageElement();
            console.log('[game] Streaming element created');
            
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        console.log('[game] Stream complete, received', aiMessage.length, 'characters');
                        break;
                    }
                    
                    // Decode chunk and append directly (text stream, no parsing needed)
                    const chunk = decoder.decode(value, { stream: true });
                    console.log('[game] Chunk received:', chunk.substring(0, 50), 'length:', chunk.length);
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
            finalizeStreamingMessage(streamingElement, 'assistant', aiMessage);
            
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
        prompt.style.flexShrink = '0'; // Prevent prompt from shrinking
        
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
        line.style.display = 'flex';
        line.style.alignItems = 'flex-start';
        line.style.gap = '0.5rem';
        
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = '$';
        prompt.style.flexShrink = '0';
        
        const text = document.createElement('span');
        text.className = 'ai-message ai-message-streaming';
        text.textContent = '';
        text.style.flex = '1';
        
        line.appendChild(prompt);
        line.appendChild(text);
        output.appendChild(line);
        
        return text;
    }

    function updateStreamingMessage(element, content) {
        if (!element) {
            console.error('[game] updateStreamingMessage: element is null');
            return;
        }
        element.textContent = content;
        const output = document.getElementById('output');
        if (output) {
            output.scrollTop = output.scrollHeight;
        }
        console.log('[game] Updated streaming message, length:', content.length);
    }

    function finalizeStreamingMessage(element, role, content) {
        element.classList.remove('ai-message-streaming');
        // Add dataset attributes for message selection
        const line = element.closest('.terminal-line');
        if (line) {
            line.classList.add('message-line');
            const finalRole = role || 'assistant';
            const finalContent = content || element.textContent;
            line.dataset.role = finalRole;
            line.dataset.content = finalContent;
            // Add click handler for selection
            line.addEventListener('click', function() {
                selectMessage(line, finalRole, finalContent);
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
        
        // Share button (opens modal)
        const shareButton = document.createElement('button');
        shareButton.id = 'share-btn';
        shareButton.className = 'share-button share-button-default';
        shareButton.textContent = 'share on github repo';
        shareButton.addEventListener('click', () => showShareModal());
        
        buttonContainer.appendChild(shareButton);
        output.appendChild(buttonContainer);
    }

    function hideShareButton() {
        const container = document.getElementById('share-buttons-container');
        if (container) {
            container.remove();
        }
    }

    function generateIdeaTemplate(selectedText, selectedMessages, fullHistory) {
        const timestamp = new Date().toISOString();
        const date = new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });

        // Extract key themes from conversation context
        const assistantMessages = fullHistory.filter(m => m.role === 'assistant').map(m => m.content);
        
        // Generate a title suggestion from selected text (first line or first 60 chars)
        const firstLine = selectedText.split('\n')[0];
        const titleSuggestion = firstLine.length > 60 
            ? firstLine.substring(0, 60).trim() + '...'
            : firstLine.trim();

        // Extract key themes from recent assistant messages
        const keyThemes = assistantMessages.length > 0 
            ? assistantMessages.slice(-3).map(msg => {
                // Extract first question or key phrase (first sentence or first 100 chars)
                const firstSentence = msg.split(/[.!?]/)[0] || msg.substring(0, 100);
                return firstSentence.trim();
            }).filter(t => t.length > 0)
            : ['Emerging from dialogue'];

        return `# Idea: ${titleSuggestion}

**Source:** Valley of the Commons Game Master Dialogue  
**Date:** ${date}  
**Selected Excerpt:**

${selectedText}

---

## Context

This idea emerged from a Socratic dialogue about game design in the Valley of the Commons.

**Key Themes:**
${keyThemes.map(theme => `- ${theme}`).join('\n')}

---

## Next Steps

- [ ] Refine this idea
- [ ] Connect to other ideas
- [ ] Propose as a tool/rule/quest/place
- [ ] Document implementation approach

---

## Full Conversation History

${formatChatHistory(fullHistory)}

---

*Generated from game master conversation*`;
    }

    function formatChatHistory(history) {
        if (!history || history.length === 0) return 'No conversation history available.';
        
        return history.map((msg, index) => {
            const prefix = msg.role === 'user' ? '>' : '$';
            const roleLabel = msg.role === 'user' ? 'User' : 'Game Master';
            return `### ${roleLabel} (${index + 1})

${prefix} ${msg.content}`;
        }).join('\n\n---\n\n');
    }

    function showShareModal() {
        if (!selectedText || selectedMessages.length === 0) {
            displayError('No text selected');
            return;
        }

        // Get full conversation history
        const fullHistory = messageHistory;

        // Generate template
        const template = generateIdeaTemplate(selectedText, selectedMessages, fullHistory);

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'share-modal';
        modal.className = 'share-modal';
        
        modal.innerHTML = `
            <div class="share-modal-content">
                <div class="share-modal-header">
                    <h2>Share Idea to GitHub</h2>
                    <button class="share-modal-close" id="share-modal-close">&times;</button>
                </div>
                <div class="share-modal-body">
                    <div class="share-template-section">
                        <label>Idea Template (editable):</label>
                        <textarea id="share-template-editor" class="share-template-editor">${escapeHtml(template)}</textarea>
                    </div>
                    <div class="share-history-section">
                        <label>Full Conversation History:</label>
                        <div class="share-history-viewer" id="share-history-viewer">
                            ${formatChatHistoryForDisplay(fullHistory)}
                        </div>
                    </div>
                </div>
                <div class="share-modal-footer">
                    <button class="share-button share-button-own" id="share-modal-cancel">Cancel</button>
                    <button class="share-button share-button-default" id="share-modal-share-default">Share (default account)</button>
                    <button class="share-button share-button-own" id="share-modal-share-own">Share (my account)</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById('share-modal-close').addEventListener('click', () => hideShareModal());
        document.getElementById('share-modal-cancel').addEventListener('click', () => hideShareModal());
        document.getElementById('share-modal-share-default').addEventListener('click', () => {
            const content = document.getElementById('share-template-editor').value;
            shareToGitHub('default', content, fullHistory);
        });
        document.getElementById('share-modal-share-own').addEventListener('click', () => {
            const content = document.getElementById('share-template-editor').value;
            shareToGitHub('own', content, fullHistory);
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideShareModal();
            }
        });

        // Focus textarea
        setTimeout(() => {
            document.getElementById('share-template-editor').focus();
        }, 100);
    }

    function formatChatHistoryForDisplay(history) {
        if (!history || history.length === 0) return '<div class="terminal-line">No conversation history available.</div>';
        
        return history.map((msg) => {
            const prefix = msg.role === 'user' ? '>' : '$';
            const roleClass = msg.role === 'user' ? 'user-message' : 'assistant-message';
            return `<div class="terminal-line ${roleClass}">${prefix} ${escapeHtml(msg.content)}</div>`;
        }).join('');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function hideShareModal() {
        const modal = document.getElementById('share-modal');
        if (modal) {
            modal.remove();
        }
    }

    async function shareToGitHub(method, content, fullHistory) {
        if (!content) {
            displayError('No content to share');
            return;
        }

        const shareButton = document.getElementById(`share-modal-share-${method === 'default' ? 'default' : 'own'}`);
        const cancelButton = document.getElementById('share-modal-cancel');
        
        if (shareButton) {
            shareButton.disabled = true;
            shareButton.textContent = 'Sharing...';
        }
        if (cancelButton) {
            cancelButton.disabled = true;
        }

        if (method === 'own') {
            // Redirect to GitHub to create issue or file with user's account
            shareWithOwnAccount(content);
            hideShareModal();
            return;
        }

        // Default: Use API with default account
        try {
            const response = await fetch('/api/share-to-github', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content, // Full template with chat history
                    excerpt: selectedText, // Keep for backwards compatibility
                    context: {
                        messages: selectedMessages,
                        fullHistory: fullHistory
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to share');
            }

            // Show success message
            displaySuccess(data.url, data.filename);
            
            // Clear selection and close modal
            hideShareModal();
            clearSelection();

        } catch (error) {
            displayError(`Failed to share: ${error.message}`);
            if (shareButton) {
                shareButton.disabled = false;
                shareButton.textContent = method === 'default' ? 'Share (default account)' : 'Share (my account)';
            }
            if (cancelButton) {
                cancelButton.disabled = false;
            }
        }
    }

    function shareWithOwnAccount(content) {
        const filename = `idea-${new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '-')}.md`;
        
        // Extract title from content (first line after "# Idea: ")
        let titleText = 'Idea from conversation';
        if (content) {
            const firstLine = content.split('\n')[0];
            const titleMatch = firstLine.match(/^# Idea:\s*(.+)$/);
            if (titleMatch && titleMatch[1]) {
                titleText = titleMatch[1].trim();
            } else if (selectedText) {
                // Fallback to selectedText if available
                titleText = selectedText.slice(0, 50);
            }
        } else if (selectedText) {
            // Fallback to selectedText if content is not provided
            titleText = selectedText.slice(0, 50);
        }
        
        // Encode content for URL
        const issueTitle = encodeURIComponent(`Idea: ${titleText.length > 50 ? titleText.substring(0, 50) + '...' : titleText}`);
        const issueBody = encodeURIComponent(`This idea was generated from a game master conversation.\n\n## File Content\n\nTo add this as a file in \`build_game/ideas/\`, use this content:\n\n\`\`\`markdown\n${content}\n\`\`\`\n\n**Suggested filename:** \`${filename}\`\n\n---\n\n*You can copy the markdown above and create a new file in the repo, or convert this issue to a pull request.*`);
        
        const owner = 'understories';
        const repo = 'votc';
        const issueUrl = `https://github.com/${owner}/${repo}/issues/new?title=${issueTitle}&body=${issueBody}&labels=idea,game-design`;
        
        // Open in new tab
        window.open(issueUrl, '_blank', 'noopener,noreferrer');
        
        // Show message
        displayMessage('system', 'Opened GitHub in new tab. Create an issue, then you can convert it to a PR or add the file directly.');
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
