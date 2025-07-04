FROM python:3.11-slim

# Set environment vars
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files (will work if env vars are present)
RUN python manage.py collectstatic --noinput || echo "Collectstatic skipped (likely due to missing envs)"

# Default command
CMD ["sh", "-c", "python manage.py migrate && gunicorn modelArena.wsgi:application --bind 0.0.0.0:8000"]
