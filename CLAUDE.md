# CLAUDE.md

This file provides guidance to Claude Code when working with code in the vegan-converter repository.

## Project Overview

Vegan Converter is a full-stack application for converting recipes, analyzing food photos, and other vegan-related utilities. It's a fresh export from the Riff platform with Python FastAPI backend and React + TypeScript frontend.

## Commands

### Backend (Python/FastAPI)

```bash
cd backend

# Install dependencies
uv sync

# Run development server (uses run.sh wrapper)
./run.sh
# or directly:
uv run uvicorn main:app --reload --port 8000

# Run tests
uv run pytest
```

### Frontend (React/Vite)

```bash
cd frontend

# Install dependencies
yarn install
# or npm install

# Run development server
./run.sh
# or directly:
npm run dev          # runs on port 5173

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

### Using Makefile

```bash
# Install both frontend and backend
make install

# Run backend
make run-backend

# Run frontend
make run-frontend
```

## Architecture

### Backend (`/backend`)

**FastAPI** application with dynamic router loading from `backend/app/apis/`. Currently includes three API modules:
- `photo_analysis/` — Photo analysis endpoints
- `recipe_conversion/` — Recipe conversion logic
- `vegan_weapons/` — Additional vegan-related utilities

**Database** (`app/libs/database.py`): AsyncPG connection pool for PostgreSQL (Neon in dev/prod). Use `get_db_connection()` as a FastAPI dependency for request-scoped connections.

**Authentication** (`app/auth/`): Built-in auth system with JWT support.

**Environment**: Config split across `.env` (shared), `.env.dev` (development), and `.env.prod` (production). Set `ENV=dev` or `ENV=prod` to select which config loads.

**Key integrations** in `app/libs/`:
- Databutton SDK for platform features
- PostgreSQL (Neon) for data persistence
- FastAPI for API server

### Frontend (`/frontend/src`)

**React 18 + TypeScript + Vite**. Routing via React Router (`src/router.tsx`). Pages in `src/pages/`.

**Auth flow**: Built-in authentication system with JWT tokens.

**Global state**: Zustand stores + built-in state management.

**API client**: `src/apiclient/` auto-generated from backend OpenAPI schema.

**UI**: Tailwind CSS + shadcn/ui components (New York style) + Chakra UI + Radix UI. Component library in `src/extensions/shadcn/`.

## Environment Variables

### Shared (`.env`)
- `DATABUTTON_PROJECT_ID`: Project ID for Databutton platform
- `DATABUTTON_CUSTOM_DOMAIN`: Custom domain configuration
- `DATABUTTON_EXTENSIONS`: Extension configuration

### Development (`.env.dev`)
- Database connection strings (Neon PostgreSQL)
- API keys and development secrets

### Production (`.env.prod`)
- Production database connection strings
- Production API keys and secrets

## Database

Uses **Neon PostgreSQL** (managed). Connection strings are in `.env.dev` and `.env.prod`.

The database connection should already be configured. If you need to claim Stack Auth ownership:
1. Visit your Riff app settings
2. Click "Claim Stack Auth Ownership" 
3. Follow the link to transfer to your own account
4. Database and app connection strings remain functional

## What Doesn't Work (Post-Export)

These Riff platform features are not available:
- ❌ Riff secrets management (use `.env` files instead)
- ❌ Riff integrations
- ❌ Automatic schedule execution (set up manually with cron)
- ❌ Riff workspace features (preview, logs, database explorer)
- ❌ Databutton SDK (removed in migration)

## Deployment

Deployed on **Railway.app** (same as aila-media) using Docker:

```bash
# Option 1: Deploy via Railway CLI
railway link  # Connect to Railway project
railway deploy

# Option 2: Use Docker locally
docker-compose up
```

**Environment Variables (set on Railway):**
- `DATABASE_URL_DEV` — Neon PostgreSQL connection (dev)
- `DATABASE_URL_PROD` — Neon PostgreSQL connection (prod)
- `OPENAI_API_KEY` — OpenAI API key for recipe conversion
- `ENV` — Set to `dev` or `prod`

**Railway Service Configuration:**
- Backend service: Dockerfile at `backend/Dockerfile` → port 8000
- Frontend service: Dockerfile at `frontend/Dockerfile` → port 3000

**Database:**
- Connection strings already configured in `.env.dev` and `.env.prod`
- Make sure you own/control the Neon database after Riff ejection

## Quick Start

```bash
# Install everything
make install

# Terminal 1 - Backend
make run-backend

# Terminal 2 - Frontend
make run-frontend

# Visit http://localhost:5173
```
