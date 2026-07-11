FROM python:3.11-slim

WORKDIR /app

RUN pip install fastapi uvicorn openai asyncpg python-dotenv pyjwt cryptography python-multipart httpx

COPY backend/ .
RUN chmod +x start.sh

# Copy pre-built frontend static files
COPY frontend/dist /app/frontend_dist

EXPOSE 8000

CMD ["./start.sh"]
