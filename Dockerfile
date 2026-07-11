FROM python:3.11-slim

WORKDIR /app

RUN pip install fastapi uvicorn openai asyncpg python-dotenv pyjwt cryptography python-multipart httpx

COPY backend/ .

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
