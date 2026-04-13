# Proyecto de Gestión de Incidencias: Acceso y Registro de Usuarios

## Descripción de la Tarea

Desarrollo de las interfaces de acceso (**index.html**) y registro (**registro.html**) para el sistema de soporte técnico. El objetivo es proporcionar una puerta de entrada segura, intuitiva y totalmente responsiva para los diferentes roles de la empresa.

## Cumplimiento de Requisitos

A continuación se detalla cómo se ha implementado cada punto solicitado para los formularios de acceso:

### 1. Diseño Responsivo y Estética Profesional
- Se ha creado una hoja de estilos centralizada (`estilosLogin.css`) utilizando variables CSS para mantener la consistencia visual.
- El diseño es **completamente responsivo**, adaptándose a cualquier dispositivo (móvil, tablet o PC) mediante el uso de Flexbox y unidades relativas.
- Se han utilizado degradados modernos para el fondo y tarjetas con sombras suaves para mejorar la experiencia de usuario.

### 2. Funcionalidad de Visualización de Contraseña (Toggle)
- Se ha implementado un botón de "ojo" a la derecha de cada campo de contraseña.
- Mediante **JavaScript**, se permite al usuario alternar entre ver la contraseña o mantenerla oculta (puntos), mejorando la usabilidad durante el registro y el acceso.

### 3. Formulario de Registro con Validación Visual
- Se han incluido campos obligatorios (`required`) para Nombre Completo, Usuario y Contraseña.
- Se ha añadido un campo específico de **Confirmar Contraseña** con un icono de escudo diferenciador y alineación corregida a la izquierda para mayor claridad visual.
- Los iconos de **FontAwesome** se han integrado en cada campo para facilitar la identificación rápida de los datos requeridos.

### 4. Flujo de Navegación y Redirección
- El formulario de Login incluye un selector de **Rol en la empresa** (Empleado, Técnico, Administrador) para la futura gestión de permisos.
- Se ha configurado el atributo `action` en ambos formularios para redirigir automáticamente al **dashboard.html** una vez que el usuario pulsa en "Entrar" o "Registrarse".
- Se han establecido enlaces de navegación cruzada entre el Login y el Registro para una navegación fluida.

## Control de versiones
Desarrollo realizado en una rama independiente `feature/login` , asegurando la integridad del código y siguiendo las buenas prácticas de Git para el trabajo colaborativo en el repositorio del proyecto.

![rama: feature/login](../Frontend/images/login.png)

## Desarrollador
- **Desarrollado por:** Miguel Á. Carrasco Moya
- **GitHub:** mcarmoy