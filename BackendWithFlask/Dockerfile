# Use lightweight Python base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy dependencies and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install gunicorn gevent

# Copy the entire backend source
COPY . .

# Expose Flask port
EXPOSE 5000

# Run using Gunicorn + gevent for async streaming (SSE)
CMD ["gunicorn", "-k", "gevent", "--timeout", "0", "-b", "0.0.0.0:5000", "app:app"]
