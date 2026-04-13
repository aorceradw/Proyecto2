# Proyecto de Gestión de Incidencias: Panel de Control (Dashboard)

## Descripción de la Tarea
Desarrollo del panel principal **"dashboard.html"** para la gestión y visualización de incidencias por parte del administrador. El objetivo es proporcionar una visión global del estado del sistema y herramientas de búsqueda rápida.

## Cumplimiento de Requisitos

A continuación se detalla cómo se ha implementado cada punto solicitado en el alcance funcional del proyecto:

### 1. Visualización de Datos (Tabla de Incidencias)
- Se ha implementado una tabla profesional para listar las incidencias, incluyendo campos para **ID**, **Título**, **Prioridad** y **Estado**.
- Cada fila incluye un botón de acción con un icono de ojo (`<i class="fas fa-eye">`) para acceder a los detalles.

### 2. Panel de Estadísticas
- Se ha creado una sección superior con tarjetas de resumen que muestran el **Total de incidencias**, las **Abiertas** y las **Críticas**.
- Se han aplicado colores semánticos (verde para abiertas, rojo para críticas) para facilitar la lectura rápida de datos.

### 3. Filtros y Buscador
- Se ha incluido un campo de búsqueda funcional por **ID o título** con un icono integrado.
- Se ha implementado un selector de estados (**Abiertas**, **Cerradas**) para filtrar la información mostrada.

### 4. Animaciones e Interactividad Avanzada
- **Efectos en botones**: El botón de "Nueva Incidencia" incluye un efecto de brillo y elevación al pasar el ratón.
- **Selector Animado**: El selector de estados cuenta con una animación 3D de inclinación y desplazamiento vertical al hacer *hover*.
- **Navegación**: Se ha configurado la incidencia **#1024** para que su botón de acción redirija a la página de detalle de incidencias.

### 5. Diseño Responsivo
- El panel es totalmente adaptable; en dispositivos móviles, las estadísticas y la sección de búsqueda se reorganizan en una sola columna para mantener la usabilidad.

## Control de versiones
Desarrollo realizado íntegramente en la rama independiente **`feature/dashboard`**, gestionando la integración con la rama `develop` mediante un flujo de trabajo colaborativo basado en Pull Requests.

![rama: feature/dashboard](../Frontend/images/dashboard.png)

## Desarrollador
- **Desarrollado por**: Antonio José
- **Archivos clave**: `dashboard.html` y `estilosDashboard.css`