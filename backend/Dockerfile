# Dockerfile (Backend)
# PROPÓSITO: Crear la imagen de Docker para nuestra API.
# ACCIÓN: Instalar Python, las librerías y encender el servidor.

FROM python:3.11-slim

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos la lista de librerías e instalamos todo
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código del backend
COPY . .

# Comando para arrancar FastAPI
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]