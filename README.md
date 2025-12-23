# Valley of the Commons

A landing page for the Valley of the Commons project by Commons Hub.

## Overview

**Our valley is at a crossroads.** Once shaped by industry, it is now quietly deserting: businesses have closed, jobs are gone, young people leave. Yet beneath this surface of decline lies a rare constellation of opportunity. Just an hour from Vienna, with Europe's cleanest water flowing from the springs next door, surrounded by fertile land and affordable real estate, the Rax valley could become something else entirely: a prototype of future living.

With the **commons hub** already established as a growing engine for community, events, and innovation, the immediate next step is expansion into an **Event Campus**. The bigger goal, however, is establishing a **Valley of the Commons**: a place where cooperative housing, cosmo-local production, and systemic resilience converge into a living laboratory of post-capitalism.

## Why here, why now?

Across Europe, villages like ours have been emptying out. Younger generations move to the cities, industries collapse, and what remains are elderly residents, shuttered factories, and a crumbling social fabric. Meanwhile, the digital nomad movement, the rise of smart villages, and the accelerating meta-crisis point towards a different trajectory: people are looking for ways out of the metropolis, towards self-sufficient and regenerative forms of life.

Our setting is uniquely well-suited for this transition:

- **Resilient resources:** The surrounding mountains cool the air and provide Vienna's drinking water, while the valleys in between contain fertile land.
- **Space to grow:** An abundance of vacant houses, commercial spaces and agricultural lots makes expansion affordable and welcomed by locals.
- **Connectivity:** One hour by train to Vienna and 90 minutes to the airport position us right at the center of Europe's rail and air connections.

With local conditions ripe and global pressures rising, it's time to turn opportunity into action and start building. The future is shaped by the actions we take today.

## From hub to valley

The **commons hub** already anchors this process. Battle-tested as an event venue and guesthouse, it hosts everything from collaborative finance conferences, solarpunk meetups, and activist gatherings to academic workshops and prototyping sessions. To an emerging Valley of the Commons, it provides:

- **An economic engine**: providing jobs, visibility, and a constant stream of curious people seeking alternatives to the status quo;
- **A platform for entrepreneurship**: supporting new event series, research projects, product prototyping, and startup incubation;
- **A beacon for metamodern thought and imagination**: holding space for narratives that orient us beyond collapse.

## Housing the future

A key pillar of the valley will be housing — not "smart homes" full of gadgets, but dwellings designed for the real challenges of the 21st century: climate change, resource constraints, and hyper-mobile lifestyles. We envision:

- **Renovated houses** integrating state-of-the-art sustainable living concepts;
- **Cooperative ownership**: from permanent co-housing to time-share models and shorter-term rentals;
- **Distributed governance**: each house organized by its residents, following the principle of subsidiarity.

The **commons hub GmbH** is a pragmatic bootstrap, but the valley itself will be **community-owned and self-governed**. Our role is to provide initial momentum — network, knowledge, infrastructure, and capital — then step back.

## Production and self-sufficiency

The Valley of the Commons won't just be a place to live — it will be a place to **collaboratively produce value** in diverse ways:

- **Digital production** in communal co-working spaces;
- **Physical production** in co-owned FabLabs seeking to develop innovative niche products and providing local manufacturing for community needs;
- **Basic needs provision**: 100% water and energy self-sufficiency asap, while gradually building food resilience through community farming.

In this way, production cycles will not only create a semi-autonomous local economy, but also build the capacity to provide for livelihoods and withstand future global disruptions.

## Governance and community

A key challenge in the political realm consists of balancing **local autonomy** with **collective coherence**, while also rebalancing the relationship between capital and labor through cooperative ownership and participatory governance. Guided by the principle of subsidiarity, we envision:

- Co-owned and self-governed **houses and productive units**;
- **Village-wide commons** coordinated through collectively chosen mechanisms;
- **Integration with municipal politics** based on mutual recognition and complementarity.

## Announcing: Popup Village 2026

For now, the Valley of the Commons remains a vision, inspired by conversations among commons-oriented networks, deep adaptation thinkers, and p2p communities preparing for civilizational transition. To make it real, it needs future commons villagers to step in.

In 2026, we plan a **4–6 week popup village** — exploring housing, governance, production, and the valley itself, with the goal of turning vision into concrete plans.

**Michel Bauwens**, eminent Commons and P2P scholar, is on board, bringing his vision of a shift toward a commons-based civilization and experience with cosmo-local production. Veterans in mutual credit, community currencies, and housing coops are planning local research projects, while community leaders from Web3 co-livings and ecovillages provide guidance to **help lay the foundations of the Valley of the Commons**.

The organizing team includes veterans of **Zuzalu** and other "zu-villages." Together, we will explore not only what is possible, but what it feels like to live in a valley oriented around the commons.

## A growing campus, a growing commons

The immediate next step on this journey is the expansion of the hub into **a monastery-like Event Campus** capable of hosting summits, exhibitions, and popups. To make this happen, we are running a **community lending campaign**, raising €200k in loans from our network to secure and renovate the buildings. **Over €80k have already been pledged**, with some lenders even donating their interest back to support future events.

Supporting **the church expansion lays the groundwork** for the Valley of the Commons — the first step toward a campus that could grow into a vibrant village.

## Get Involved

🌱 **Lend to us** – help bridge the final stretch of funding.

🙋‍♂️ **Pre-register** for the 2026 popup village.

✍️ **Write to** f.fritsch@commons-hub.at **to get involved** in the popup organization.

Together, we can turn vision into reality.

## Setup Instructions

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Vercel account (for deployment)
- Google Cloud account (for waitlist functionality)
- Vercel AI Gateway API key (for game chat)
- GitHub Personal Access Token (for idea sharing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/understories/votc.git
cd votc
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see below)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

**Required for Waitlist:**
- `GOOGLE_SERVICE_ACCOUNT` - Google Service Account JSON (as string)
- `GOOGLE_SHEET_ID` - Google Sheets spreadsheet ID
- `GOOGLE_SHEET_NAME` - Sheet name (optional, defaults to 'Waitlist')

**Required for Game Chat:**
- `GAME_INTELLIGENCE` or `AI_GATEWAY_API_KEY` - Vercel AI Gateway API key (starts with `vck_`)
- `GAME_MODEL` - AI model name (optional, defaults to `mistral/ministral-3b`)

**Required for GitHub Sharing:**
- `GITHUB_TOKEN` - GitHub Personal Access Token
- `GITHUB_OWNER` - Repository owner (optional, defaults to 'understories')
- `GITHUB_REPO` - Repository name (optional, defaults to 'votc')
- `GITHUB_BRANCH` - Branch name (optional, defaults to 'main')
- `GITHUB_PATH` - Path for ideas (optional, defaults to 'build_game/ideas')

**Note:** Never commit `.env` files. See `.env.example` for a template (if available).

### Local Development

1. For static pages (landing page, game page):
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

2. For full functionality with serverless functions:
```bash
# Install Vercel CLI
npm i -g vercel

# Run local development server
npx vercel dev
```

The local server will be available at `http://localhost:3000` (or the port specified).

### Deployment

Deploy to Vercel:

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` and follow the prompts
3. Set environment variables in Vercel dashboard (Settings → Environment Variables)
4. Deploy: `vercel --prod`

**Important:** All environment variables must be set in the Vercel dashboard for production.

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

## Waitlist Functionality

The site includes a waitlist form that securely stores email addresses in a private Google Sheet. The integration uses:

- **Frontend:** HTML form with JavaScript for submission handling
- **Backend:** Vercel serverless function (`/api/waitlist.js`) that acts as a secure proxy
- **Storage:** Google Sheets (private, accessible only to admins)

**Setup Instructions:** See `refs/google-sheets-setup.md` for detailed configuration steps.

**Security:** All Google Sheets credentials are stored in Vercel environment variables and never exposed to the client. The Google Sheet remains private even though the code is public.


## Design Notes

This landing page follows the design aesthetic of commons-hub.at:
- Clean, minimal design
- Uppercase headings
- Sticky CTA button that scrolls with the page
- Responsive layout
- Modern typography

## License

© 2025 Commons Hub

