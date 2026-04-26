# Proyecto de Gestión de Incidencias: Formulario de Alta

## Descripción de la Tarea

Desarrollo del formulario **"incidencias.html"** a partir de los requisitos del proyecto. El objetivo es proporcionar al usuario una interfaz donde pueda reportar un problema técnico.


## Cumplimiento de Requisitos

A continuación se detalla cómo se ha implementado cada punto solicitado en la hoja de requisitos:

### 1. Campos de Texto (Título y Categoría)
- Se ha implementado un campo de entrada de texto para que el usuario escriba un **Título de la Incidencia**. Este campo es obligatorio (`required`).
- Se ha creado otro campo de texto para especificar la **Categoría** del problema.

### 2. Descripción Larga (Textarea)
- Se ha incluido un área de texto grande (`<textarea>`) etiquetada como **Descripción detallada**.
- Se han configurado los atributos `rows="6"` y el estilo CSS `width: 100%` y `box-sizing: border-box` para que ocupe todo el ancho disponible del cuadro contenedor, respetando los márgenes.

### 3. Selector de Prioridad
- Se ha implementado un menú desplegable etiquetado como **Prioridad**.
- Este selector incluye cuatro opciones para que el usuario elija: **Baja**, **Media**, **Alta** y **Crítica**.

### 4. Botón de "Enviar" y Redirección
- Se ha añadido un botón final con la etiqueta **"Enviar Incidencia"** y un icono de papel de avión (`<i class="fas fa-paper-plane">`).
- Se ha modificado el botón "Nueva Incidencia" en `dashboard.html`, sustituyendo la etiqueta `<button>` por un enlace `<a>` que redirige correctamente a `incidencias.html` (con el permiso d emi compañero Antonio).


## Control de versiones
Desarrollo realizado en una rama independiente (`feature/formulario-incidencias`) siguiendo el flujo de trabajo colaborativo recomendado.

## Desarrollador
- Desarrollado por: **Josemi LG**
- GitHub: **jLinGom**

--------------------------------------------------------------------------------------------------------------------------------------------

# Proyecto de Gestión de Incidencias: Tests Unitarios del Backend

## Descripción de la Tarea

Desarrollo de las pruebas unitarias del backend en **`backend/tests/test_main.py`** y configuración del entorno de tests en **`backend/tests/conftest.py`**. El objetivo es verificar que los endpoints principales de la API responden correctamente, sin necesidad de conexión a la base de datos real (Amazon RDS).

## Cumplimiento de Requisitos

### 1. Configuración del entorno de tests (conftest.py)
- Se ha creado el archivo `conftest.py` que sustituye la conexión a Amazon RDS por una base de datos **SQLite en memoria** durante la ejecución de los tests.
- Esto permite ejecutar las pruebas en cualquier máquina sin necesidad de credenciales ni conexión a la nube.

### 2. Test del endpoint raíz
- Se verifica que `GET /` responde con código **200 OK**.
- Se comprueba que el cuerpo de la respuesta es exactamente `{"mensaje": "API de Incidencias funcionando"}`.

### 3. Test del listado de incidencias
- Se verifica que `GET /incidencias` responde con código **200 OK**.
- Se comprueba que la respuesta es una lista.

### 4. Tests de filtrado por prioridad
- Se verifica que `GET /incidencias?prioridad=alta` responde con **200 OK** y devuelve una lista.
- Se verifica que `GET /incidencias?prioridad=media` responde con **200 OK** y devuelve una lista.

## Control de versiones

Desarrollo realizado en una rama independiente (`feature/tests-Josemi`).

## Desarrollador
- Desarrollado por: **Josemi LG**
- GitHub: **jLinGom**