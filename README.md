# Sistema de Gestión de Incidencias

El objetivo del proyecto es crear una aplicación web funcional que permita a los usuarios reportar y consultar incidencias a través de una interfaz amigable, mientras que los datos se guardan de forma centralizada en una base de datos MySQL alojada en Amazon RDS.

## Estructura del Proyecto

La organización del proyecto sigue el patrón de separación entre el Frontend y el Backend, lo que permite que cada parte pueda desarrollarse y desplegarse de manera independiente:

```
mi-aplicacion/
├── Frontend/
│   ├── index.html
│   ├── css/
│   │   ├── estilosLogin.css
│   │   ├── estilosDashboard.css
│   │   ├── estilosFormulario.css
│   │   └── estilosincidencias.css
│   ├── js/
│   │   ├── main.js
│   │   ├── api.js
│   │   └── productos-ui.js
│   ├── pages/
│   │   ├── dashboard.html
│   │   ├── incidencias.html
│   │   ├── detalle-incidencias.html
│   │   └── registro.html
│   ├── nginx/
│   │   └── default.conf
│   ├── Dockerfile
│   └── images/
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   └── models.py
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_main.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## Instalación y Ejecución

Para ejecutar la aplicación existen dos enfoques: utilizando Docker Compose (recomendado para producción) o ejecutando localmente sin contenedores (útil para desarrollo).

### Requisitos Previos

Necesitas tener lo siguiente instalado en tu máquina:

Para ejecutar con Docker: Docker y Docker Compose
Para ejecutar sin Docker: Python 3.9 o superior

### Ejecución con Docker Compose 

Docker gestiona todo automáticamente.

Paso 1: Configurar las variables de entorno

Primero tienes que crear el archivo .env con tus credenciales de AWS RDS:

```bash
cp .env.example .env
```

Luego editas el archivo .env y reemplazas los valores de ejemplo con tus datos reales de la base de datos RDS:

```
DB_HOST=tu-endpoint-rds.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=tu_contraseña
DB_NAME=incidencias_db
```

Paso 2: Iniciar los servicios

Una vez configuradas las variables de entorno, abres una terminal en la carpeta principal del proyecto y ejecutas:

```bash
docker-compose up --build
```

Este comando construye las imágenes de Docker y levanta todos los servicios. La primera ejecución puede tardar algunos minutos.

Paso 3: Acceder a la aplicación

Una vez que los servicios estén en ejecución, puedes acceder a:

La aplicación web: localhost (puerto 80)
La documentación de la API: localhost:8000/docs
El health check de la API: localhost:8000/health

### Ejecución Sin Docker (Desarrollo Local)

Si prefieres ejecutar la aplicación sin Docker, sigue estos pasos:

#### Configuración del Backend

Abre una terminal y navega a la carpeta backend:

```bash
cd backend
```

Crea un entorno virtual de Python para aislar las dependencias:

```bash
python -m venv venv
```

Activa el entorno virtual:

En Linux o macOS:

```bash
source venv/bin/activate
```

En Windows:

```bash
venv\Scripts\activate
```

Instala las dependencias de Python:

```bash
pip install -r requirements.txt
```

Ejecuta el servidor FastAPI:

```bash
uvicorn app.main:app --reload
```

El servidor estará disponible en localhost:8000

#### Configuración del Frontend

Abre otra terminal en la carpeta principal y navega a Frontend:

```bash
cd Frontend
```

Si tienes Python instalado, puedes servir los archivos estáticos:

```bash
python -m http.server 8080
```


La aplicación estará disponible en localhost:8080

## Descripción de Componentes

### Frontend

El Frontend está compuesto por:

Los archivos HTML en la raíz y en la carpeta pages/, que definen la estructura de las páginas (login, dashboard, detalle de incidencias).

El archivo main.js que es el encargado de manejar la lógica del cliente: autenticación, filtrado de incidencias, navegación entre páginas y comunicación con la API.

Los estilos CSS en la carpeta css/, que definen la apariencia visual de la aplicación.

Nginx actúa como servidor web y proxy inverso. Sirve los archivos estáticos (HTML, CSS, JavaScript) y redirige las peticiones a la API hacia el Backend.

### Backend

El Backend es una API REST construida con FastAPI que proporciona los siguientes endpoints:

GET / devuelve el estado de la API
GET /health realiza un health check del servidor
GET /incidencias devuelve la lista de incidencias con soporte para filtros
GET /incidencias/{id} devuelve los detalles de una incidencia específica
POST /incidencias crea una nueva incidencia

Los parámetros de filtro disponibles son:

estado=abierta para filtrar solo incidencias abiertas
prioridad=alta para filtrar por nivel de prioridad
Estos parámetros se pueden combinar en una misma consulta

### Base de Datos

La base de datos MySQL alojada en AWS RDS contiene las siguientes tablas:

Tabla incidencias: almacena información sobre cada incidencia (id, título, descripción, prioridad, estado, quién la reportó, fecha de creación, fecha de última actualización).

Tabla usuarios: almacena información de los usuarios del sistema (id, usuario, contraseña, rol, email, fecha de creación).

## Pruebas

Para verificar que la API funciona correctamente, se han incluido pruebas unitarias. Para ejecutarlas:

```bash
cd backend
pytest tests/test_main.py -v
```

Las pruebas validan que todos los endpoints respondan correctamente y que los filtros funcionan como se espera.

## Flujo de Datos

El funcionamiento de la aplicación sigue este flujo:

1. El usuario abre localhost en su navegador web
2. Nginx recibe la petición y sirve el archivo index.html
3. El navegador descarga el HTML, CSS y JavaScript
4. El usuario se autentica completando el formulario de login
5. JavaScript guarda las credenciales en localStorage del navegador
6. El usuario navega al dashboard y JavaScript realiza un fetch a la API
7. Las peticiones a /api/ son interceptadas por Nginx y redirigidas al Backend en puerto 8000
8. FastAPI recibe la petición y consulta la base de datos en AWS RDS
9. Los datos se devuelven en formato JSON
10. JavaScript recibe la respuesta y actualiza el HTML con los datos obtenidos
11. El usuario ve la información actualizada en su navegador

## Desarrollo

A continuación se explica cómo agregar nuevas funcionalidades a la aplicación.

### Agregar un nuevo endpoint en el Backend

Para agregar un nuevo endpoint a la API:

1. Abre el archivo backend/app/main.py
2. Define una función decorada con app.get(), app.post(), app.put() o app.delete() según la operación
3. Implementa la lógica necesaria
4. Agrega una prueba correspondiente en backend/tests/test_main.py
5. Ejecuta pytest para validar que todo funciona

### Agregar funcionalidad en el Frontend

Para agregar nueva funcionalidad en el Frontend:

1. Abre el archivo Frontend/js/main.js
2. Define una nueva función con un nombre descriptivo
3. Invócala desde el evento correspondiente (evento de botón, load, etc.)
4. Prueba la funcionalidad abriendo la consola del navegador con F12

### Modificar el modelo de datos

Para cambiar la estructura de los datos:

1. Edita backend/app/models.py con las nuevas columnas o tablas
2. Ejecuta las migraciones correspondientes
3. Reinicia el contenedor Docker para que apliquen los cambios

## Notas Importantes

El archivo main.js se encuentra en la carpeta Frontend/js/, recuerda actualizar cualquier referencia si lo mueves.

Usa la consola del navegador (F12) para debugging: aquí verás los logs de JavaScript y los errores de red.

Las credenciales de AWS RDS deben estar en el archivo .env. Nunca commites este archivo a Git.


---

Desarrollado por: Ángela Orcera (líder de proyecto)
Última actualización: 25 de abril de 2026
