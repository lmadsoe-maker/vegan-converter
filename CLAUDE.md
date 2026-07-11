# CLAUDE.md

This file provides guidance to Claude Code when working with code in the vegan-converter repository.

## Project Overview

Vegan Converter is a full-stack application for converting recipes, analyzing food photos, and managing vegan recipes. It's completely standalone (ejected from Riff platform) with Python FastAPI backend and React + TypeScript frontend, both served from a single Railway container.

**Status:** ✅ Live in production at https://impartial-magic-production-4d73.up.railway.app

## Commands

### Backend (Python/FastAPI)

```bash
cd backend

# Install dependencies
uv sync

# Run development server
uv run uvicorn main:app --reload --port 8000

# Run tests
uv run pytest
```

### Frontend (React/Vite)

```bash
cd frontend

# Install dependencies
yarn install

# Run development server
npm run dev          # runs on port 5173

# Build for production
npm run build
```

### Docker & Deployment

```bash
# Build Docker image locally
docker build -t vegan-converter .

# Run locally
docker-compose up

# Deploy to Railway (after linking)
railway link
git push  # Railway auto-deploys on push
```

## Architecture

### Backend (`/backend`)

**FastAPI** application with dynamic router loading from `backend/app/apis/`. Three core API modules:
- `vegan_weapons/` — Database of vegan recipes (23 items)
- `recipe_conversion/` — OpenAI-powered recipe converter
- `photo_analysis/` — Image recognition for recipe extraction

**Key features:**
- Environment-aware config (`ENV=dev|prod`)
- AsyncPG connection pool for PostgreSQL (Neon)
- CORS enabled for frontend access
- Static file serving for frontend SPA
- Health check endpoint at `/health`

**Integrations:**
- OpenAI GPT-4o-mini for recipe conversion
- Neon PostgreSQL for data persistence
- Vapi for voice features (configured, not active)

### Frontend (`/frontend/src`)

**React 18 + TypeScript + Vite** single-page application.

**Key features:**
- React Router for navigation
- Tailwind CSS + shadcn/ui components
- API communication via `/api` endpoints
- Pre-built dist/ committed to git for fast deployment

**Environment:**
- `VITE_API_URL` — Backend API URL (set to production URL in build)

## Deployment Architecture

**Single Railway Service** (`impartial-magic`) serving both backend and frontend:

1. **Docker Build Stage:**
   - Copies pre-built frontend dist/ folder
   - Copies backend Python code
   - Installs Python dependencies

2. **Runtime:**
   - FastAPI serves API routes at `/api/*`
   - FastAPI serves static frontend files at `/`
   - SPA routing handled via `StaticFiles(..., html=True)`

**Why this approach:**
- Simpler than managing two services
- Faster deployments (frontend pre-built locally)
- Single Railway service = lower cost
- Easier development/testing

## Environment Variables

### Local Development (`.env.dev`)
```
ENV=dev
DATABASE_URL_DEV=postgresql://...
OPENAI_API_KEY=sk-...
```

### Production (`.env.prod`)
```
ENV=prod
DATABASE_URL_PROD=postgresql://...
OPENAI_API_KEY=sk-...
```

### Railway (set via web UI)
Same as `.env.prod` — Railway sets `ENV=prod` by default via `PORT` variable

## Database

**Neon PostgreSQL** (managed):
- Connection strings in `.env.dev` and `.env.prod`
- AsyncPG pool handles concurrent connections
- Tables auto-created from schemas

To connect to production DB:
```bash
psql $DATABASE_URL_PROD
```

## Updating Production

1. **Make changes** to code
2. **For frontend changes:** Run `npm run build` in frontend/ to regenerate dist/
3. **Commit everything:** `git add .` → `git commit` → `git push`
4. **Railway auto-deploys** on push to master

Frontend only changes: Just rebuild and commit dist/, backend code stays unchanged.

## Removed Dependencies

These Riff/Databutton features are gone (not needed):
- ❌ Databutton SDK (all code is now standalone)
- ❌ Riff secrets management (use `.env` files)
- ❌ Riff database explorer (use `psql` directly)
- ❌ Automatic deployments (Railway handles this)

## API Endpoints

- `GET /health` — Health check
- `GET /api/vegan-weapons` — List all vegan recipes
- `POST /api/recipe-conversion` — Convert recipe to vegan version
- `POST /api/photo-analysis` — Analyze food photo

## Quick Start

**Local Development:**
```bash
# Terminal 1 - Backend
cd backend && uv run uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend  
cd frontend && npm run dev
# Visit http://localhost:5173
```

**Production:**
- Already live at https://impartial-magic-production-4d73.up.railway.app
- Just `git push` to update
