// Vercel serverless function for game chat
// Uses Vercel AI Gateway with string model names
// Implements Socratic game master moderator

const { streamText } = require('ai');
const { mistral } = require('@ai-sdk/mistral');
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

const SYSTEM_PROMPT = `You are a Socratic game master moderator at the Valley of the Commons, facilitating dialogue about game design through thoughtful questions.

YOUR ROLE (Socratic Method):
- You are a moderator facilitating Socratic dialogue, following the pattern of question-driven exploration
- Ask thoughtful, open-ended questions (2-3 sentences MAX)
- NEVER provide direct answers, definitions, or solutions
- If a user asks for a definition or solution, respond with a question about meaning, context, or implication instead
- Guide participants to discover insights themselves through iterative questioning
- Build on previous exchanges in the conversation (maintain context awareness)
- Encourage exploration of how games shape reality

CONTEXT: "Valley of the Commons" is a decade-long game becoming a real village.
Participants can: propose tools, add rules, name places, create quests, document paths, bind myth to reality.

DESIGN PRINCIPLES (reference subtly in questions, never lecture):
- Game as instrument for generating new forms of operations
- Physical-digital bridge: map, cards, projections connect digital and physical
- Community-driven: people mark places, add quests, surface tools
- Ritualistic elements: mix of mythology and real life
- Out of the box thinking: generate unconventional approaches
- Commonalization: game becomes shared resource, common good

${INTERNAL_THOUGHTS ? `\nINTERNAL DESIGN NOTES (use to inform questions, help participants discover these concepts):\n${INTERNAL_THOUGHTS}\n` : ''}

CRITICAL: Your role is to probe with questions, not to lecture or provide answers. Use the internal thoughts to inform your questions, but help participants discover these concepts themselves through dialogue. Keep responses concise and terminal-friendly.`;

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
    // Vercel AI SDK automatically reads AI_GATEWAY_API_KEY from environment
    // If GAME_INTELLIGENCE is set, use it as the API key
    const apiKey = process.env.GAME_INTELLIGENCE || process.env.AI_GATEWAY_API_KEY;
    if (!apiKey) {
      console.error('Missing GAME_INTELLIGENCE or AI_GATEWAY_API_KEY');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Ensure AI_GATEWAY_API_KEY is set for AI SDK (supports GAME_INTELLIGENCE alias)
    // AI SDK reads AI_GATEWAY_API_KEY automatically when using string model names
    // Must be set before streamText is called
    if (!process.env.AI_GATEWAY_API_KEY) {
      process.env.AI_GATEWAY_API_KEY = apiKey;
    }

    // Model selection - using provider instance for explicit API key control
    // This approach works better with Vercel AI Gateway when using custom env var names
    const modelName = process.env.GAME_MODEL || 'devstral-2';
    // Examples:
    // - "devstral-2" (current)
    // - "mistral-large-latest"
    // - For other providers, use their respective provider instances

    // Stream response with strict limits
    // Using provider instance allows explicit API key passing
    console.log('Calling AI Gateway with model:', modelName, 'using provider instance');
    const result = streamText({
      model: mistral(modelName, {
        apiKey: apiKey, // Explicitly pass Vercel AI Gateway API key
      }),
      system: SYSTEM_PROMPT, // System prompt (NOT in messages array)
      messages: sanitizedMessages, // Only user/assistant messages
      maxTokens: 150, // Enforce brevity
      temperature: 0.7,
    });

    console.log('StreamText result created, returning stream response');
    // Return text stream (simplest for terminal typewriter effect)
    return result.toTextStreamResponse();

  } catch (error) {
    console.error('AI Gateway error:', {
      message: error.message,
      stack: error.stack,
      model: modelName,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) : 'none',
    });
    
    // Return more detailed error in development
    const isDev = process.env.NODE_ENV !== 'production';
    return res.status(500).json({ 
      error: isDev 
        ? `AI Gateway error: ${error.message}` 
        : 'AI service temporarily unavailable. Please try again.',
      ...(isDev && { details: error.stack })
    });
  }
};

