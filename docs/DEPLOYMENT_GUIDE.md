# Deployment Guide: Vercel & Render

This guide outlines step-by-step deployment instructions for the Spotify Listener Behaviour Analysis and Optimal Release-Window Advisor.

---

## 1. Prerequisites
1. **GitHub Repository:** `https://github.com/KARTHIK-BATTIPROLU/IDS-Casestudy-.git` (Main branch contains complete monorepo).
2. **Render Account:** Free account on [render.com](https://render.com).
3. **Vercel Account:** Free account on [vercel.com](https://vercel.com).

---

## 2. Deploy R Plumber API to Render

### Option A: Using Render Blueprint (`render.yaml`)
1. Log in to your Render Dashboard.
2. Click **New +** -> **Blueprint**.
3. Connect your GitHub repository `KARTHIK-BATTIPROLU/IDS-Casestudy-`.
4. Render will automatically detect `render.yaml`.
5. Click **Apply**. Render will build and deploy the Dockerized R service.

### Option B: Manual Web Service Setup
1. Click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name:** `spotify-ids-r-api`
   - **Runtime:** `Docker`
   - **Root Directory:** `services/r-api` (or keep root with Dockerfile path `services/r-api/Dockerfile`)
   - **Instance Type:** `Free`
4. Add Environment Variables:
   - `PORT`: `8000`
   - `API_SECRET_KEY`: Generate a secure random string (e.g. `dev-secret-key-spotify-ids-2026`)
   - `ALLOWED_ORIGINS`: `http://localhost:3000,https://*.vercel.app`
5. Click **Create Web Service**.
6. Once deployed, copy your Render service URL (e.g., `https://spotify-ids-r-api.onrender.com`).
7. Verify by testing: `GET https://spotify-ids-r-api.onrender.com/health`.

---

## 3. Deploy Next.js Web App to Vercel

1. Log in to your Vercel Dashboard.
2. Click **Add New...** -> **Project**.
3. Import the repository `KARTHIK-BATTIPROLU/IDS-Casestudy-`.
4. Configure the project settings:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click "Edit" and select **`apps/web`**.
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Configure Environment Variables:
   - `R_API_URL`: Your Render service URL (e.g., `https://spotify-ids-r-api.onrender.com`)
   - `R_API_SECRET_KEY`: The matching secret string configured on Render
   - `NEXT_PUBLIC_APP_URL`: Your public Vercel domain
6. Click **Deploy**.
7. Vercel will install dependencies, compile the production bundle, and provide your live URL (e.g. `https://spotify-ids.vercel.app`).

---

## 4. Post-Deployment Smoke Testing Checklist
- [ ] Visit Vercel homepage and verify hero and navigation render cleanly.
- [ ] Visit `/research` and inspect the 168-hour heatmap and 95% CIs chart.
- [ ] Visit `/upload` and click "Load 22-Track Sample".
- [ ] Click "Analyze in R Analytical Engine" and verify that personalized recommendations appear.
- [ ] Click "Export Ranked Advice (.csv)" and verify the downloaded file.
- [ ] Test cold-start handling: If the Render service was idle, verify that the UI shows the warming up indicator without crashing.
