# Screenshot API Backend - Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `express` - Web server
- `cors` - Enable CORS for frontend
- `playwright` - Already installed for tests

### 2. Run Backend Server

```bash
npm run dev:api
```

Server runs on: **http://localhost:3001**

### 3. Run Frontend (in another terminal)

```bash
npm run dev
```

Frontend runs on: **http://localhost:5174**

### 4. Test It

1. Open http://localhost:5174/scraping
2. Enter URL: `https://www.iqos.com/fr/fr/home.html`
3. Click "🚀 Analyze Site"
4. Wait ~10-15 seconds
5. See **REAL screenshots** captured by Playwright!

---

## Alternative: Run Both Together

```bash
npm run dev:all
```

This starts both frontend and backend servers simultaneously.

---

## How It Works

```
Frontend (Vite)                Backend (Express + Playwright)
http://localhost:5174          http://localhost:3001

User enters URL
     │
     ▼
ScraperInput.jsx
     │
     ▼
screenshotService.js
     │
     └─── POST /api/screenshot {"url": "..."}
                    │
                    ▼
              server.mjs
                    │
              ┌─────┴─────┐
              │ Playwright│
              │  Browser  │
              └─────┬─────┘
                    │
              Captures 4 screenshots:
              • Full page
              • Viewport (hero)
              • Desktop view
              • Mobile view
                    │
              Saves to: public/scraping-reports/{timestamp}/
                    │
              Returns URLs
                    │
     ┌────────────<─┘
     │
     ▼
ScraperReport.jsx displays real screenshots
```

---

## Screenshots Location

Screenshots are saved to:
```
public/scraping-reports/
  ├── 1714147200000/
  │   ├── full-page.png
  │   ├── viewport.png
  │   ├── desktop.png
  │   └── mobile.png
  ├── 1714147300000/
  │   └── ...
```

Accessible via: `http://localhost:3001/screenshots/{timestamp}/full-page.png`

---

## API Endpoints

### POST /api/screenshot
Capture screenshots of a URL

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "screenshots": [
    {
      "type": "full-page",
      "section": "Complete page",
      "width": 1920,
      "height": 3840,
      "url": "/screenshots/1714147200000/full-page.png",
      "path": "1714147200000/full-page.png"
    },
    ...
  ],
  "reportId": 1714147200000
}
```

### GET /api/health
Health check

**Response:**
```json
{
  "status": "ok",
  "service": "screenshot-service"
}
```

---

## Fallback Behavior

If backend is **not running**:
- Frontend automatically falls back to placeholder images
- User sees colored placeholders with labels
- No errors thrown

To use real screenshots:
- ✅ Backend MUST be running on port 3001
- ✅ Playwright installed (`npm install`)

---

## Troubleshooting

### Backend not starting?
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process if needed
kill -9 <PID>

# Restart backend
npm run dev:api
```

### Screenshots not showing?
1. Check backend is running: `curl http://localhost:3001/api/health`
2. Check browser console for errors
3. Verify CORS is enabled (already configured)
4. Check `public/scraping-reports/` folder exists

### Playwright issues?
```bash
# Reinstall Playwright browsers
npx playwright install chromium
```

---

## Production Deployment

For production, you'll need:

1. **Backend deployed** (Vercel, Railway, Render, etc.)
2. **Update API_URL** in `screenshotService.js`:
   ```javascript
   const API_URL = process.env.VITE_SCREENSHOT_API_URL || 'http://localhost:3001/api'
   ```
3. **Add environment variable**:
   ```bash
   VITE_SCREENSHOT_API_URL=https://your-backend.com/api
   ```
4. **Static file hosting** for screenshots (S3, Cloudinary, etc.)

---

## Performance

- **Full page**: ~2-3 seconds
- **Viewport**: ~1-2 seconds  
- **Desktop**: ~1-2 seconds
- **Mobile**: ~1-2 seconds

**Total**: ~7-10 seconds for 4 screenshots

Can be optimized with:
- Parallel captures (Promise.all)
- Screenshot caching
- Lower quality settings
- Skip animations (`waitUntil: 'domcontentloaded'`)
