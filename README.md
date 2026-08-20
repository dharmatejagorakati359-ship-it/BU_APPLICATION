# A Little Journey

A cinematic interactive apology/memory journey built with React, TypeScript, Vite, Framer Motion and React Three Fiber.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Customize

Edit:

`src/config.ts`

Replace:

- `senderName`
- `recipientName`
- `phoneNumber`
- `whatsappUrl`
- memories
- questions
- apology text

Put optional ambient audio at:

`public/music/ambient.mp3`

Music starts OFF by design.

## Build

```bash
npm run build
npm run preview
```

## Deploy

This is a normal Vite SPA and can be deployed to Vercel, Netlify, Cloudflare Pages, GitHub Pages (with SPA routing considerations), or any static host.

## Important

The phone and WhatsApp actions are intentionally configurable. Do not publish a real number until you are ready to share it.

Question responses are held only in browser memory and are not sent to a backend.
