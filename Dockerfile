FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV BODA_CORS_ORIGINS=https://abdullahosama-coder.github.io

EXPOSE 7860

CMD python seed.py products-data.js && uvicorn app.main:app --host 0.0.0.0 --port 7860
