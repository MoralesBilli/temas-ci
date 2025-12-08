# Imagen base
FROM python:3.12-slim

# Crear carpeta de trabajo
WORKDIR /app

# Copiar requirements
COPY Backend/requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el backend
COPY Backend .

# Exponer el puerto
EXPOSE 5000

# Comando para correr la app (ajusta a tu archivo principal)
CMD ["python", "app.py"]
