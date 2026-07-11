FROM node:20-alpine AS frontend-builder

WORKDIR /app

RUN corepack enable

COPY frontend/package.json frontend/yarn.lock ./

RUN yarn install --frozen-lockfile

COPY frontend/ .

RUN VITE_API_URL=https://impartial-magic-production-4d73.up.railway.app yarn build && ls -la dist/


FROM python:3.11-slim

WORKDIR /app

RUN pip install fastapi uvicorn openai asyncpg python-dotenv pyjwt cryptography python-multipart httpx

COPY backend/ .
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]
