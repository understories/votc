// Vercel serverless function to share conversation excerpts to GitHub
// Creates idea files in build_game/ideas/ directory

const { Octokit } = require('@octokit/rest');

// Generate idea file template
function generateIdeaTemplate(excerpt, context) {
  const timestamp = new Date().toISOString();
  const date = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  return `# Idea: [Auto-generated from conversation]

**Source:** Valley of the Commons Game Master Dialogue  
**Date:** ${date}  
**Excerpt:**

${excerpt}

---

**Context:** This idea emerged from a Socratic dialogue about game design in the Valley of the Commons.

**Next Steps:**
- [ ] Refine this idea
- [ ] Connect to other ideas
- [ ] Propose as a tool/rule/quest

---

*Generated from game master conversation*`;
}

// Generate unique filename based on timestamp
function generateFilename() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `idea-${year}-${month}-${day}-${hours}${minutes}${seconds}.md`;
}

module.exports = async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { excerpt, context } = req.body;

    // Validate input
    if (!excerpt || typeof excerpt !== 'string') {
      return res.status(400).json({ error: 'Excerpt is required' });
    }

    // Sanitize excerpt (limit length, prevent injection)
    const sanitizedExcerpt = excerpt.slice(0, 5000).trim();
    if (sanitizedExcerpt.length === 0) {
      return res.status(400).json({ error: 'Excerpt cannot be empty' });
    }

    // Get GitHub configuration
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error('Missing GITHUB_TOKEN');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const owner = process.env.GITHUB_OWNER || 'understories';
    const repo = process.env.GITHUB_REPO || 'votc';
    const branch = process.env.GITHUB_BRANCH || 'main';
    const basePath = process.env.GITHUB_PATH || 'build_game/ideas';

    // Initialize Octokit
    const octokit = new Octokit({
      auth: token,
    });

    // Generate filename and path
    const filename = generateFilename();
    const path = `${basePath}/${filename}`;

    // Generate file content
    const fileContent = generateIdeaTemplate(sanitizedExcerpt, context || {});

    // Create file in GitHub
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: owner,
      repo: repo,
      path: path,
      message: 'Add idea from game master conversation',
      content: Buffer.from(fileContent).toString('base64'),
      branch: branch,
    });

    // Generate GitHub URL
    const githubUrl = `https://github.com/${owner}/${repo}/blob/${branch}/${path}`;

    return res.status(200).json({
      success: true,
      url: githubUrl,
      filename: filename,
      path: path,
    });

  } catch (error) {
    console.error('GitHub API error:', {
      message: error.message,
      status: error.status,
      stack: error.stack,
    });

    // Handle specific GitHub API errors
    if (error.status === 401) {
      return res.status(500).json({ 
        error: 'Authentication error. Please contact support.' 
      });
    }

    if (error.status === 403) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      });
    }

    if (error.status === 404) {
      return res.status(500).json({ 
        error: 'Repository not found. Please contact support.' 
      });
    }

    if (error.status === 422) {
      return res.status(400).json({ 
        error: 'Invalid file path. Please try again.' 
      });
    }

    // Generic error
    return res.status(500).json({ 
      error: 'Failed to share to GitHub. Please try again later.' 
    });
  }
};

