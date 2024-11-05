FROM python:3.11

WORKDIR /app

# Set environment variable for msgpack
ENV MSGPACK_PUREPYTHON=1

# Update pip
RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Run the application
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
