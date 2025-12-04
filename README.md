# Bac Story — Stories, tips and resources for the baccalauréat

Bac Story is a small, easy-to-run website where students can share short exam stories, practical study tips and useful resources. The project is intentionally simple so anyone can read the code, run it locally, and extend it when they want to add a server or more features.

This repository includes a static, client-side demo. Posts in the demo are read from data/posts.json and any posts you submit from the site are saved in your browser. That keeps the demo private and easy to experiment with.

Quick highlights

- Simple, mobile-friendly layout with accessible markup
- Client-side search and a light/dark theme toggle
- Local submissions (stored in localStorage) for a zero-configuration demo
- No build step required — works as plain static files

Quick start

1. Clone the repository:
   git clone https://github.com/islemredouane/Bac-Story-Website.git
   cd Bac-Story-Website

2. Serve the files locally:
   - Minimal (no install):
     npx http-server -c-1 . -p 8080
     Open http://localhost:8080

   - Live reload (during development):
     npx live-server --port=8080
     Open http://localhost:8080

Files you will work with

- index.html — main page and markup
- css/styles.css — visual styles
- js/app.js — client-side logic (loading posts, search, local posts)
- data/posts.json — sample posts included with the demo
- assets/logo.svg — site logo

How the demo stores posts

- Sample posts are in data/posts.json.
- When you submit a post on the site it is saved in your browser under the localStorage key `bacstory:posts`.
- On load the site shows local posts first, then the sample posts from data/posts.json.

If you want public submissions

The demo intentionally keeps submissions local. To accept public posts, add a backend or a hosted database (examples below). When you do, validate and sanitize incoming content and consider a simple moderation flow.

Suggested server options

- Small Node/Express API
  - GET /api/posts
  - POST /api/posts
  - Store posts in a database (SQLite, Postgres) or an object store.
  - Validate inputs and sanitize content before saving.

- Serverless or hosted databases
  - Firebase Firestore or Supabase are fast to set up.
  - Use security rules to protect write access or require moderation.

Security and moderation notes

- Escape or sanitize any user-provided HTML before rendering.
- Validate required fields on the server side (name, subject, content, type).
- Consider an approval status for posts: pending → approved → rejected.
- Add rate limits and spam protection (CAPTCHA, throttling) when the site accepts public submissions.

Accessibility and privacy

- Forms include labels and keyboard-friendly focus order.
- Text and UI colors are chosen for readable contrast and there is a theme toggle for preference.
- LocalStorage is used only for the demo and keeps user submissions private to each browser. If you add a backend, document how long you keep posts and any user data.

Deploying the site

- GitHub Pages: Enable Pages in repository settings and publish from the main branch or a dedicated branch.
- Netlify / Vercel: Connect the repository and set the publish directory to the repository root.
- Docker + Nginx: Serve static files from a small Nginx container for production.

Contributing

Thanks for helping make this better. A simple workflow works well:

1. Fork the repository.
2. Create a branch for your change: git checkout -b feat/my-change
3. Make your changes and commit with clear messages.
4. Push and open a pull request explaining the change and any testing notes.

When your change affects the UI, include screenshots or a replay of the behavior so reviewers can test quickly.

License

This project is available under the MIT License. See the LICENSE file for the full text.

Contact

Repository: https://github.com/islemredouane/Bac-Story-Website
Owner: islemredouane
