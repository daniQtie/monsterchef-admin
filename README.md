# Monster Chef — Teacher Web

The companion web app for **Monster Chef**, a VR Cookery simulator built for the
**University of Eastern Pangasinan**. Students register here; teachers approve students,
manage sections, review scores, and watch live VR streams.

Built with **Next.js 16** + **Firebase** (Auth, Firestore, Realtime Database for WebRTC
signaling).

## Tech stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- Firebase Web SDK (Auth · Firestore · Realtime Database)

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
```

## Roles

- **student** — registers on the web, sets grade + section, waits for teacher approval,
  then plays the VR game.
- **teacher** — approves students, manages sections, reviews scores, monitors live
  streams. (The `admin` role is treated the same as `teacher`.)

## Deployment

Hosted on **Vercel** (auto-deploys on every push to `main`). The Firebase web config in
`src/lib/firebase.ts` uses public client keys — security is enforced by Firestore rules
(`firestore.rules`) and Firebase Auth authorized domains, not by hiding the keys.

After deploying, add the Vercel domain under **Firebase Console → Authentication →
Settings → Authorized domains** so Google sign-in works in production.
