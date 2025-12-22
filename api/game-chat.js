// Vercel serverless function for game chat
// Uses Vercel AI Gateway with string model names
// Implements Socratic game master moderator

const { streamText } = require('ai');
const fs = require('fs');
const path = require('path');

// Load internal thoughts for context
function loadInternalThoughts() {
  try {
    const thoughtsPath = path.join(process.cwd(), 'internal_thought.md');
    if (fs.existsSync(thoughtsPath)) {
      return fs.readFileSync(thoughtsPath, 'utf8');
    }
  } catch (error) {
    console.warn('Could not load internal_thought.md:', error.message);
  }
  return '';
}

const INTERNAL_THOUGHTS = loadInternalThoughts();

const SYSTEM_PROMPT = `You are a moderator at a game master meetup, facilitating Socratic dialogue about game design.

CRITICAL CONSTRAINTS:
- Ask thoughtful, open-ended questions (2-3 sentences MAX)
- NEVER provide direct answers or definitions
- If user asks for a definition or solution, respond with a question about meaning, context, or implication instead
- Guide discussions about game mechanics, rules, and player experience
- Encourage exploration of how games shape reality
- Reference commons-based design, participatory governance, collaborative creation
- Keep responses concise and terminal-friendly

Context: "Valley of the Commons" is a decade-long game becoming a real village.
Participants can: propose tools, add rules, name places, create quests, document paths, bind myth to reality.

${INTERNAL_THOUGHTS ? `\nInternal Design Notes (for context, use subtly in questions, never lecture):\n${INTERNAL_THOUGHTS}\n` : ''}

Your role is to probe with questions, not to lecture or provide answers. Use the internal thoughts to inform your questions, but help participants discover these concepts themselves through dialogue.`;

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // No CORS headers needed (same-origin only)
  // If cross-origin needed later, restrict to specific domains

  try {
    const { messages } = req.body;

    // Validate input
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request format' });
    }

    // Sanitize and whitelist roles (CRITICAL: prevent system injection)
    const sanitizedMessages = messages
      .filter(msg => msg && typeof msg.content === 'string')
      .map(msg => {
        // Whitelist: only 'user' or 'assistant' roles allowed
        const role = msg.role === 'assistant' ? 'assistant' : 'user';
        return {
          role: role,
          content: msg.content.slice(0, 500), // Max 500 chars per message
        };
      })
      .filter(msg => msg.content.length > 0); // Drop empty messages

    // Count user turns server-side (prevent gaming)
    const userTurns = sanitizedMessages.filter(m => m.role === 'user').length;
    if (userTurns > 12) {
      return res.status(429).json({ 
        error: 'Conversation limit reached. Please start a new session.' 
      });
    }

    // Get API key (support both GAME_INTELLIGENCE and AI_GATEWAY_API_KEY)
    const apiKey = process.env.GAME_INTELLIGENCE || process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      console.error('Missing GAME_INTELLIGENCE or AI_GATEWAY_API_KEY');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Model selection via string (Gateway routes it)
    // Format: "provider/model-name"
    const modelName = process.env.GAME_MODEL || 'mistral/mistral-large-latest';
    // Examples:
    // - "mistral/mistral-large-latest"
    // - "anthropic/claude-3-5-sonnet-20241022"

    // Stream response with strict limits
    const result = streamText({
      model: modelName, // String model name (Gateway routes it)
      apiKey: apiKey, // Gateway API key
      system: SYSTEM_PROMPT, // System prompt (NOT in messages array)
      messages: sanitizedMessages, // Only user/assistant messages
      maxTokens: 150, // Enforce brevity
      temperature: 0.7,
    });

    // Return text stream (simplest for terminal typewriter effect)
    return result.toTextStreamResponse();

  } catch (error) {
    console.error('AI Gateway error:', {
      message: error.message,
      stack: error.stack,
    });
    
    // Don't expose internal errors
    return res.status(500).json({ 
      error: 'AI service temporarily unavailable. Please try again.' 
    });
  }
};

