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