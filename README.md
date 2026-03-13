# X Focus Filter

**A Chrome extension that filters your X (Twitter) timeline to only show content you actually care about.**

Tired of scrolling through spam, NSFW content, crypto scams, and engagement bait on X? X Focus Filter uses local keyword matching to hide irrelevant tweets and surface only the topics that matter to you — Tech, AI, Business, Open Source, and more.

No API keys. No data collection. No server. Everything runs locally in your browser.

## The Problem

X's timeline is full of noise:
- Spam and NSFW/adult content mixed into your feed
- Crypto scam promotions and fake giveaways
- Engagement bait and rage-inducing culture war posts
- Content completely unrelated to your professional interests

The algorithmic timeline doesn't respect your time. **X Focus Filter gives you control back.**

## How It Works

The extension scans each tweet as it loads and matches it against curated keyword dictionaries. Tweets that don't match your selected topics are smoothly hidden. No page reloads, no delays — it works in real-time as you scroll.

```
Tweet loads → Keyword matching → Show or Hide
```

- **Whitelist mode**: Only tweets matching your selected topics are shown
- **Blacklist**: Known spam/NSFW patterns are always filtered out
- **Custom keywords**: Add your own whitelist/blacklist terms
- **User whitelist**: Specific accounts always show through

## Features

- **8 Topic Categories** — Toggle on/off with one click:
  - 💻 Tech — Software, hardware, cloud, programming languages
  - 🤖 AI/ML — LLMs, deep learning, agents, image generation
  - 📈 Business — Startups, funding, markets, fintech
  - 🔓 Open Source — GitHub, releases, package managers
  - 🎨 Design — UI/UX, Figma, design systems, accessibility
  - 🪙 Crypto — Blockchain, DeFi, Web3, smart contracts
  - 🚀 Indie Dev — Side projects, bootstrapping, build in public
  - 💼 Career — Hiring, remote work, interviews, freelance

- **3 Filter Modes**:
  - 🔒 **Strict** — Requires 2+ keyword matches (very precise)
  - 🎯 **Normal** — Single keyword match (balanced)
  - 🌊 **Relaxed** — Includes broader related terms (more content)

- **Peek Mode** — Temporarily reveal filtered tweets at low opacity to check for false positives

- **Custom Keywords** — Add comma-separated terms to always show or always hide

- **User Whitelist** — Ensure specific accounts are never filtered

- **Bilingual** — Full English and Chinese (中文) UI support

- **Real-time Stats** — See how many tweets were scanned, shown, and hidden

- **Floating Badge** — Unobtrusive on-page indicator with quick toggle

## Installation

### From Source (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/vorojar/x-focus-filter.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **Load unpacked** and select the cloned folder

5. Navigate to [x.com](https://x.com) — the extension starts working automatically

## Screenshot

<img src="./screenshots/popup.png" width="340" alt="X Focus Filter popup interface" />

## How the Keyword Matching Works

Each topic category contains a curated dictionary of keywords (50-100+ terms per category, in both English and Chinese). When a tweet loads:

1. The tweet text, author name, and any card/link preview text are extracted
2. The combined text is checked against the global blacklist (spam, NSFW, scams)
3. If not blacklisted, it's matched against your active topic keywords
4. In **Strict** mode, at least 2 keywords must match
5. In **Relaxed** mode, additional broader terms are included

Short keywords (≤3 chars like "AI", "API", "SDK") use word-boundary matching to avoid false positives.

## Privacy

- **Zero data collection** — No analytics, no tracking, no telemetry
- **No network requests** — All filtering happens locally via keyword matching
- **No API keys needed** — Works entirely offline after installation
- **Minimal permissions** — Only requests access to x.com/twitter.com and local storage

## Built With

- Vanilla JavaScript (no frameworks, no build step)
- Chrome Extension Manifest V3
- MutationObserver for real-time DOM monitoring

## Contributing

Contributions are welcome! Some ideas:

- Add new topic categories with keyword dictionaries
- Improve keyword coverage for existing categories
- Add support for other languages
- Port to Firefox/Safari

## License

MIT
