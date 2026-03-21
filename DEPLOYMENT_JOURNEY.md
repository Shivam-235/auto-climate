# ENVIZIO Full-Stack Deployment Journey

This document serves as a record of the challenges faced while deploying the ENVIZIO (auto-climate) full-stack application (Vite Frontend + Node/Socket.io Backend) to Vercel and Render, along with the step-by-step solutions implemented.

---

## Challenge 1: Vercel building `0 modules transformed`
**The Problem:** 
Vercel was successfully reading the repository but wasn't actually building the React application, resulting in a blank or unbuilt deployment.
**The Cause:** 
Vercel was looking at the root directory by default, and the frontend `package.json` was missing a `build` script.
**The Solution:**
1. Added `"build": "vite build"` to `frontend/package.json`.
2. Changed the **Root Directory** in Vercel settings from the default to `frontend`.

---

## Challenge 2: Git Push Authentication Failed
**The Problem:** 
Trying to push the new build script via `git push` resulted in: `Invalid username or token. Password authentication is not supported`.
**The Cause:** 
GitHub removed the ability to push code using account passwords for security reasons.
**The Solution:**
1. Navigated to GitHub Developer Settings and created a Personal Access Token (PAT) with `repo` scopes.
2. Updated the local git remote URL to embed the token: `git remote set-url origin https://<TOKEN>@github.com/...`

---

## Challenge 3: Blank White Screen After Deployment
**The Problem:** 
The Vercel site successfully deployed, but after the initial loading animation, the website crashed and became completely white.
**The Cause:** 
In Vite, files inside the `/src` folder are not statically served verbatim to the browser. The React Three Fiber components were trying to load `useGLTF('/src/assets/neptune/scene.gltf')`, which threw a 404 error and broke the React rendering tree.
**The Solution:**
1. Moved the `neptune` folder and `need_some_space.glb` from `frontend/src/assets/` into `frontend/public/`.
2. Updated all references in `LandingPageNew.jsx` to load from the root path (e.g., `useGLTF('/neptune/scene.gltf')`).

---

## Challenge 4: Socket.IO & API Defaulting to Localhost
**The Problem:** 
The application UI loaded, but data was showing as `--` and the status was `Offline` (Connection Refused).
**The Cause:** 
The frontend code (`App.jsx`, `api.js`, `AuthContext.jsx`) had `http://localhost:4000` hardcoded.
**The Solution:**
1. Implemented environment variables across the frontend.
2. Switched from hardcoded localhost to `import.meta.env.VITE_API_URL`.
3. Added the `VITE_API_URL` environment variable to Vercel pointing to the new live Render backend.

---

## Challenge 5: React Router 404 After Refreshing
**The Problem:** 
Clicking links worked fine, but if the user refreshed the page on a route like `https://auto-climate.vercel.app/dashboard`, Vercel showed a `404 NOT FOUND` error.
**The Cause:** 
As a Single Page Application (SPA), there is only one `index.html`. Browsers request the exact path (`/dashboard.html`), which doesn't exist on Vercel's static servers.
**The Solution:**
1. Created a `vercel.json` file inside the `frontend/` folder.
2. Configured a rewrite rule to redirect all traffic (`/(.*)`) back to `/index.html`, allowing React Router to handle the URL paths natively.

---

## Challenge 6: Strict Cross-Origin Resource Sharing (CORS) Blocks
**The Problem:** 
The console showed `Blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value... that is not equal to the supplied origin`.
**The Cause:** 
Socket.io has a strict CORS policy when `credentials: true` is enabled. It requires an exact origin match. When copying local `.env` values to Render, `FRONTEND_URL` was accidentally left as `http://localhost:5174`, and later set to a unique Vercel preview URL (`https://auto-climate-3vprl7w9...`) rather than the main production domain.
**The Solution:**
1. Updated the backend `server.js` to dynamic CORS origin checking: `origin: process.env.FRONTEND_URL`.
2. Updated the Render `FRONTEND_URL` environment variable to perfectly match the primary URL being visited in the browser (`https://auto-climate.vercel.app`), without any trailing slashes.

---

### End Result
A robust, fully separated frontend and backend deployment. The frontend builds statically on Vercel using Vite's optimized bundling, while the backend continuously listens for Express HTTP calls and multiplexed Socket.IO WebSocket traffic on Render!
