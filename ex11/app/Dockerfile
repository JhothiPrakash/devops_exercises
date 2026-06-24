# 1. Base Image: Use a specific, lightweight version of Python
FROM python:3.11-slim

# 2. Security: Create a non-root user and group (Industry Best Practice)
RUN addgroup --system appgroup && adduser --system --group appuser

# 3. Workspace: Set the working directory inside the container
WORKDIR /app

# 4. System Dependencies: Install C-libraries required specifically for PostgreSQL (psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 5. Dependency Installation: Copy requirements first to leverage Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Application Code: Copy the actual script into the container
COPY main.py .

# 7. Security: Hand over ownership of the files to the non-root user
RUN chown -R appuser:appgroup /app

# 8. Security: Switch away from the root user
USER appuser

# 9. Execution: Run Python in unbuffered mode (ensures logs show up immediately in Kubernetes)
CMD ["python", "-u", "main.py"]