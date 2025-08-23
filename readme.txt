# Trump Blocker

A Chrome extension that blocks unwanted political content across the web, with an optional premium subscription for advanced features.

## Features

- 🚫 Block content from 6 predefined categories
- 🌟 Premium: Add up to 100 custom keywords
- 🔒 Premium: 2FA parental controls
- 🛡️ Privacy-first: All filtering happens locally

## Project Structure

```
TrumpBlocker/
├── extension/          # Chrome extension
├── website/           # Next.js website
├── docs/              # Documentation
└── README.md
```

## Development

### Extension
1. Load unpacked extension in Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `extension` folder

### Website
1. Navigate to the `website` folder
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Run development server: `npm run dev`

## Environment Variables

Create `website/.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PRICE_ID=your_price_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment

### Website
Deploy to Vercel, Netlify, or your preferred platform.

### Extension
1. Build and zip the extension folder
2. Upload to Chrome Web Store
3. Update API_BASE_URL in popup.js to your deployed website

## License

MIT License - see LICENSE file for details.