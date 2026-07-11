FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile

COPY frontend/ .
RUN yarn build


FROM python:3.11-slim

WORKDIR /app

RUN pip install fastapi uvicorn openai asyncpg python-dotenv pyjwt cryptography python-multipart httpx

COPY backend/ .
RUN chmod +x start.sh

# Copy built frontend static files
COPY --from=frontend-build /frontend/dist /app/frontend_dist

EXPOSE 8000

CMD ["./start.sh"]
