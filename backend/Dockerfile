FROM python:3.13-slim

WORKDIR /app

# deps first for layer caching; psycopg2-binary ships a wheel, no build tools needed
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# Apply migrations, then serve. App Runner health-checks the port.
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8080"]
