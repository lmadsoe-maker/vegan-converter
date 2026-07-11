FROM python:3.11-slim

WORKDIR /app

RUN pip install fastapi uvicorn openai asyncpg python-dotenv pyjwt cryptography python-multipart httpx

COPY backend/ .
COPY frontend/dist ./frontend/dist

RUN chmod +x start.sh

EXPOSE 8000

CMD ["./start.sh"]
