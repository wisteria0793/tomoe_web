# Base image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libmariadb-dev-compat \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Upgrade pip, setuptools, and wheel
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy clean requirements and install
COPY guesthouse_tomoe/requirements_docker.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Working directory within the Django project
WORKDIR /app/guesthouse_tomoe

# Expose port
EXPOSE 8000

# Default command for direct container runs; overridden by docker-compose in dev
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--chdir", "/app/guesthouse_tomoe", "guesthouse_tomoe.wsgi:application"]
