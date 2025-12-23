# Valley of the Commons

Landing page and interactive game terminal for the Valley of the Commons project by Commons Hub.

## Overview

Valley of the Commons is a four-week pop-up village in the Austrian Alps (August 24 – September 20, 2026), where people come together to imagine and rehearse life beyond extractive systems. This repository contains the public-facing website and interactive game master interface.

**Get Involved:**
- 🌱 [Pre-register](https://www.commons-hub.at/events/valley-26) for the 2026 popup village
- ✍️ Contact f.fritsch@commons-hub.at to get involved

## Setup

### Prerequisites

- Node.js 18.x+
- Vercel account (for deployment)
- Google Cloud account (for waitlist)
- Vercel AI Gateway API key (for game chat)
- GitHub Personal Access Token (for idea sharing)

### Installation

```bash
git clone https://github.com/understories/votc.git
cd votc
npm install
```

### Environment Variables

Create `.env` in the root directory:

**Waitlist:**
- `GOOGLE_SERVICE_ACCOUNT` - Google Service Account JSON (string)
- `GOOGLE_SHEET_ID` - Google Sheets spreadsheet ID
- `GOOGLE_SHEET_NAME` - Sheet name (default: 'Waitlist')

**Game Chat:**
- `GAME_INTELLIGENCE` or `AI_GATEWAY_API_KEY` - Vercel AI Gateway key (starts with `vck_`)
- `GAME_MODEL` - Model name (default: `mistral/ministral-3b`)

**GitHub Sharing:**
- `GITHUB_TOKEN` - GitHub Personal Access Token
- `GITHUB_OWNER` - Repo owner (default: 'understories')
- `GITHUB_REPO` - Repo name (default: 'votc')
- `GITHUB_BRANCH` - Branch (default: 'main')
- `GITHUB_PATH` - Ideas path (default: 'build_game/ideas')

### Local Development

**Static pages only:**
```bash
python3 -m http.server 8000
# or: npx http-server
```

**Full functionality (with serverless functions):**
```bash
npx vercel dev
```

### Deployment

```bash
npm i -g vercel
vercel
# Set environment variables in Vercel dashboard
vercel --prod
```

## Project Structure

```
votc/
├── index.html          # Main landing page
├── game.html           # Game terminal interface
├── privacy.html        # Privacy FAQ page
├── styles.css          # Landing page stylesheet
├── game.css            # Game page stylesheet
├── waitlist.js         # Waitlist form handler (client-side)
├── game.js             # Game terminal logic
├── package.json        # Node.js dependencies
├── vercel.json         # Vercel configuration
├── internal_thought.md # Game design context for AI
├── api/
│   ├── waitlist.js     # Serverless function for Google Sheets
│   ├── game-chat.js    # Serverless function for AI chat
│   └── share-to-github.js # Serverless function for GitHub sharing
├── refs/               # Internal documentation (gitignored)
└── README.md           # This file
```

## Features

- **Landing Page** - Event information and waitlist signup
- **Game Terminal** - Interactive Socratic dialogue with AI game master
- **Idea Sharing** - Share conversation excerpts to GitHub as structured ideas
- **Privacy-First** - No tracking, no cookies, no user accounts

**Waitlist:** Stores emails in private Google Sheets via serverless function. See `refs/google-sheets-setup.md` for setup.

**Game Chat:** Uses Vercel AI Gateway with Mistral models. See `refs/llm-integration-plan-v2.1.md` for architecture.

**Security:** All credentials stored in Vercel environment variables. No secrets in code.


## Design Notes

This landing page follows the design aesthetic of commons-hub.at:
- Clean, minimal design
- Uppercase headings
- Sticky CTA button that scrolls with the page
- Responsive layout
- Modern typography

## License

© 2025 Commons Hub

