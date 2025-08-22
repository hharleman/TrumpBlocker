# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trump Blocker is a Chrome extension with a companion Next.js website for managing premium subscriptions. The extension blocks political content on web pages using keyword filtering, with premium features available through the website.

## Commands

### Website (Next.js)
- `cd website` - Navigate to website directory
- `npm install` - Install dependencies
- `npm run dev` - Start development server (localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Extension Development
- Load unpacked extension: Chrome → Extensions → Developer mode → Load unpacked → select `extension` folder
- No build step required - extension runs directly from source files

## Architecture

### Extension Structure
- **manifest.json**: Chrome extension configuration (manifest v3)
- **content.js**: Main content script that scans and blocks content using keyword matching
- **background.js**: Service worker handling storage, messaging, and extension lifecycle
- **popup.js/popup.html**: Extension popup UI for settings management
- **styles/**: CSS files for content blocking placeholders and popup styling

### Website Structure (Next.js App Router)
- **app/**: Next.js 13+ app directory structure
- **app/api/**: API routes for Stripe checkout and Clerk authentication
- **app/components/ui/**: Reusable UI components (shadcn/ui style)
- **app/dashboard/**: Premium user dashboard
- **app/lib/utils.ts**: Utility functions using clsx and tailwind-merge

### Key Technologies
- **Extension**: Vanilla JavaScript, Chrome Extension API (manifest v3)
- **Website**: Next.js 14, TypeScript, Tailwind CSS, Clerk (auth), Stripe (payments)
- **UI Components**: Radix UI primitives with custom styling
- **Storage**: Chrome extension sync storage for settings

## Content Blocking Logic

The extension uses predefined keyword categories (trump, vance, rightwing, redpill, foxnews, redpillcontent) plus custom keywords. It scans page content using MutationObserver and replaces blocked content with styled placeholders that allow users to reveal content if desired.

## Environment Variables

Website requires `.env.local` with:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `NEXT_PUBLIC_APP_URL`

## Development Notes

- Extension has no TypeScript - uses vanilla JavaScript
- Website uses TypeScript with strict mode enabled
- File extensions: Website uses `.ts` for layout/page files, `.tsx` for components
- Extension communicates with website via popup iframe for premium features
- Settings sync between extension and website through Chrome storage API