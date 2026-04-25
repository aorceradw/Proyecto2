# Dockerfile para Frontend
# Receta para construir la imagen Docker del servidor web (Nginx)

# Paso 1: Usar imagen base de Nginx
# nginx:alpine es muy pequeña (~40MB) y perfecta para servir archivos estáticos
FROM nginx:alpine

# Paso 2: Copiar configuración personalizada de Nginx
# Reemplazamos la configuración por defecto con nuestra configuración
# que incluye el proxy inverso para conectar con el backend
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Paso 3: Copiar archivos del frontend
# Copiamos todos nuestros HTML, CSS, JS al directorio que Nginx sirve
COPY . /usr/share/nginx/html/

# Paso 4: Exponer el puerto
# Nginx escucha en puerto 80 (puerto estándar de HTTP)
EXPOSE 80

# Nginx se inicia automáticamente cuando arrancamos el contenedor
# No necesitamos especificar un CMD porque nginx:alpine ya lo hace por defecto