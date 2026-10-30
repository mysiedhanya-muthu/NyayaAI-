# Stage 1: Build React Frontend SPA
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Backend & Integrated Hosting
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-builder /app/frontend/dist ./backend/static

WORKDIR /app/backend

ENV HOST=0.0.0.0
ENV PORT=8000
ENV FRONTEND_DIST=/app/backend/static
ENV ENV=production

EXPOSE 8000

CMD ["python", "run.py"]
