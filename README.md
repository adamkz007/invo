# Invo - Modern Invoicing for Malaysian Freelancers & SMEs

Invo is a simple, practical invoicing solution designed specifically for Malaysian small businesses and freelancers.

## Features

- **Simple Invoicing**: Create professional invoices in seconds
- **Customer Relationships**: Keep track of all your clients in one place
- **Business Insights**: See how your business is performing with easy-to-understand charts
- **Time-Saving Tools**: Set up recurring invoices and automated reminders
- **Work Anywhere**: Access your business from your phone, tablet, or computer

## PWA Support

Invo is now a Progressive Web App (PWA), which means it can be installed on your device and used offline. Features include:

- **Installable**: Add Invo to your home screen for quick access
- **Offline Support**: Continue working even without an internet connection
- **App-like Experience**: Full-screen mode without browser UI elements
- **Automatic Updates**: Always get the latest version

To install Invo on your device:
1. Open the website in a compatible browser (Chrome, Edge, Safari, etc.)
2. Look for the "Add to Home Screen" or "Install" option in your browser
3. Follow the prompts to install

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the root directory and add necessary environment variables:

```
NEXT_PUBLIC_API_URL=your_api_url
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxx.supabase.co:5432/postgres
JWT_SECRET=your_jwt_secret
```

## Deployment

This application can be easily deployed to Vercel, Netlify, or any other platform that supports Next.js.

### GitHub Repository

The source code is available on GitHub and can be cloned using:

```
git clone https://github.com/adamkz007/invo.git
```

## License

All rights reserved © Invo
