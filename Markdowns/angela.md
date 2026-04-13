# Mi Rol como Líder del Proyecto

## Introducción

He asumido el rol de **Líder del Proyecto y Arquitecta Cloud**, lo que significa que he sido responsable de diseñar toda la infraestructura, organizar el equipo y establecer los estándares de desarrollo. Desde crear el repositorio en GitHub hasta desplegar la arquitectura en AWS, ha sido un desafío pero muy gratificante ver cómo todo toma forma.

---

## 1. Gestión del Repositorio y Estructura del Proyecto

Lo primero que hice fue **crear el repositorio en GitHub**. Sin un lugar centralizado para el código, es imposible trabajar en equipo de forma ordenada. Definí una estructura escalable y clara:

- **Frontend/**: Interfaz con HTML5, CSS3 y JavaScript
- **Docker**: Configuraciones para containerización
- **Documentación**: Markdowns y especificaciones

Hice que mis compañeros clonaran el repositorio con `git clone` para que todos trabajáramos desde la misma base.

![github](./images/github.png)

### Coordinación del Equipo con GitFlow

He implementado gitflow donde cada miembro del equipo:

- **Crea ramas features** (`feature/nombre-funcionalidad`) para desarrollar de forma independiente
- **Abre Pull Requests** cuando termina, para que revisemos el código antes de mergear
- **Mantiene la rama develop** estable y lista para producción

Esto nos permite trabajar sin conflictos y tener un historial limpio de cambios.

---

## 2. Desarrollo Frontend: Detalle de Incidencia

He maquetado y diseñado la vista **"Detalle de Incidencia"**, una de Esta vista es el corazón de la interacción del usuario con el sistema.

### Tecnologías Utilizadas

- **HTML**: Estructura accesible
- **CSS**: Diseño responsive que se adapta a cualquier dispositivo
- **Font Awesome**: Iconografía moderna y consistente

### Funcionalidades Implementadas

He desarrollado dos componentes clave:

**1. Sistema de Chat**

- Historial completo de mensajes entre usuario y equipo de soporte
- Interfaz intuitiva para enviar nuevos comentarios
- Timestamps y identificación clara de quién escribe

**2. Línea de Tiempo de Estados**
Cada incidencia pasa por diferentes estados. Implementé una visualización clara que muestra:

- Creada
- En revisión
- Asignada a técnico
- En resolución
- Cerrada

Así el usuario ve exactamente en qué punto está su solicitud en todo momento.

### Estructura HTML del Sistema de Estados

```html
<!-- Línea de tiempo de estados de la incidencia -->
<section class="states-timeline">
  <div class="state-item completed">
    <div class="state-circle">✓</div>
    <div class="state-label">Creada</div>
    <p class="state-date">08/04/2026 - 14:30</p>
  </div>

  <div class="state-item completed">
    <div class="state-circle">✓</div>
    <div class="state-label">En revisión</div>
    <p class="state-date">08/04/2026 - 15:45</p>
  </div>

  <div class="state-item active">
    <div class="state-circle"></div>
    <div class="state-label">Asignada a técnico</div>
    <p class="state-date">09/04/2026 - 09:00</p>
  </div>

  <div class="state-item pending">
    <div class="state-circle"></div>
    <div class="state-label">En resolución</div>
  </div>
</section>

<!-- Sistema de comentarios -->
<section class="comments-section">
  <h3>Registro de Comentarios</h3>
  <div class="comment">
    <strong>Antonio García</strong> - 08/04/2026 14:30
    <p>Detectamos que la conexión con la BD está fallando...</p>
  </div>
</section>
```

---

## 3. Infraestructura AWS: Arquitectura Segura de Red

He diseñado e implementado toda la arquitectura cloud en AWS. Esto es probablemente lo más crítico del proyecto, ya que define la seguridad y el rendimiento de la aplicación.

### EC2: Instancia de Computación

He creado una **instancia EC2 con Debian** que aloja el frontend. Elegí Debian por su estabilidad probada en entornos de producción y su excelente manejo de actualizaciones de seguridad.


**Especificaciones:**

- Sistema Operativo: Debian (estable, ligero, seguro)
- Rol: Ejecuta el contenedor Docker con Nginx
- Ubicación: Subred Pública para acceso de usuarios

### VPC: Diseño de Red Segmentado

He implementado una **VPC personalizada** con segmentación estratégica de red para máxima seguridad.

#### Subred Pública (Frontend)

- **Propósito**: Aloja la instancia EC2 con el frontend
- **Acceso a Internet**: Sí, mediante Internet Gateway
- **Usuarios**: Pueden acceder a la aplicación desde cualquier lugar
- **Security Group**: Solo puertos 80 (HTTP) y 22 (SSH limitado)
![EC2 Debian](./images/lodeec2.png)

#### Subred Privada (Base de Datos)

- **Propósito**: Reservada para MariaDB y datos sensibles
- **Acceso a Internet**: NO - totalmente aislada
- **Comunicación**: Solo con la subred pública a través del Security Group
- **Máxima Seguridad**: El puerto 3306 (MariaDB) es completamente inaccesible desde internet

![image-2026-04-13-15-39-23](ec2privi.png)

Esta arquitectura asegura que la base de datos **nunca esté expuesta** a internet. Solo puede comunicarse con la aplicación en la subred pública.

```
Internet (usuarios)
    ↓
Internet Gateway
    ↓
Subred Pública (EC2 + Frontend)
    ↓
Security Group (permite comunicación interna)
    ↓
Subred Privada (MariaDB - sin acceso internet)
```

### Security Groups: Control Granular de Acceso

He configurado reglas de firewall muy restrictivas:

**EC2 Security Group (Subred Pública):**

- Puerto 80 (HTTP): Abierto a 0.0.0.0/0 para que usuarios accedan
- Puerto 22 (SSH): Restringido SOLO a mi IP personal
- Todos los demás puertos: BLOQUEADOS

**MariaDB Security Group (Subred Privada):**

- Puerto 3306 (MariaDB): SOLO desde el EC2 (nunca accesible desde internet)
- Todos los demás puertos: BLOQUEADOS

Esta configuración garantiza que:
Los usuarios puedan usar la aplicación  
 Yo pueda administrar el servidor por SSH  
 La BD esté completamente protegida  
 No haya puertos innecesarios abiertos

---

## 4. Docker: Containerización con Nginx Alpine

He containerizado la aplicación usando Docker para garantizar portabilidad, eficiencia y consistencia entre entornos. El frontend se sirve con **Nginx Alpine**.

### El Dockerfile

```dockerfile
FROM nginx:alpine

# Copiamos los archivos HTML y CSS al directorio de Nginx
COPY Frontend/ /usr/share/nginx/html/

# Copiamos la configuración personalizada de Nginx
COPY Frontend/nginx/default.conf /etc/nginx/conf.d/default.conf

# Exponemos el puerto 80
EXPOSE 80

# Iniciamos Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Por qué nginx:alpine

He elegido **nginx:alpine** específicamente porque:

- **Rápida**: Se inicia en milisegundos
- **Eficiente**: Usa muy pocos recursos de CPU y memoria
- **Nginx**: Servidor web de altísimo rendimiento, ideal para contenido estático

En AWS pagamos por los recursos que usamos. Una imagen pesada sería un desperdicio de dinero. Con Alpine obtenemos máxima eficiencia.

### Configuración de Nginx

En `default.conf` he configurado Nginx para:

- Servir los archivos HTML desde `/usr/share/nginx/html/`
- Manejo correcto de rutas y redirecciones
- Cacheo inteligente de archivos estáticos (CSS, imágenes)
- Compresión Gzip para reducir transferencia de datos

---

### Estructura de Ramas

**Rama develop** (Rama principal de desarrollo)

- Donde convergen todas las features completadas
- Siempre está en estado de compilación exitosa
- Es la rama "lista para testing"

**Ramas feature/** (Trabajo del equipo)

- Cada feature en su propia rama: `feature/nombre-funcionalidad`
- Ejemplo: `feature/detalle-incidencias`, `feature/login`, `feature/dashboard`
- Cada miembro trabaja independientemente sin afectar a otros

### Flujo de Trabajo

1. **Creo una rama feature** desde `develop` con un nombre descriptivo
2. **Hago commits atómicos** con mensajes claros que expliquen qué se cambió
3. **Subo el código a GitHub** regularmente
4. **Abro un Pull Request** cuando termino, describiendo qué funcionalidades implementé
5. **El equipo revisa** el código (code review)
6. **Mergeo a develop** cuando la revisión es aprobada

Este proceso asegura que:

- El código sea revisado antes de entrar a la rama principal
- Cada cambio tenga trazabilidad (quién, qué, cuándo)
- No haya conflictos masivos de merge
- La rama develop siempre sea deployable

---

## 6. Resumen: Mis Responsabilidades como Líder

Como **Líder del Proyecto y Arquitecta Cloud**, he asumido estas responsabilidades:

**Diseño Arquitectónico**: VPC completa, subredes, security groups, EC2  
**Seguridad**: Configuración de firewall, aislamiento de BD, SSH restringido  
**Infraestructura**: AWS, Docker, Nginx, MariaDB  
**Estándares**: Establecí GitFlow y flujo de code review para el equipo  
**Frontend crítico**: Desarrollé la vista más compleja (Detalle de Incidencia)  
**Documentación**: Dejé todo documentado para que otros entiendan y continúen

### Tecnologías que Utilicé

- **AWS**: VPC, EC2, Security Groups, Route Tables, Internet Gateway
- **Docker**: Dockerfile, Nginx Alpine, optimización de imágenes
- **Frontend**: HTML5, CSS.
- **BD**: MariaDB en subred privada aislada
- **Git**: GitFlow, Pull Requests.

---

## Conclusión

Honestamente, cuando empecé no sabía si realmente se me daría bien liderar un equipo. Pensaba que sería complicado organizar todo mientras hacía pero me sorprendí. **He descubierto que se me da mejor de lo que imaginaba.**

 Aprendí que:

- **Los flujos de trabajo importan**: GitFlow no es solo nomenclatura de ramas. Es la diferencia entre caos y orden. Tener un proceso claro acelera el trabajo en equipo.
- **La organización es la base de todo**: Plaificar bien al inicio (estructura, repositorio...) ahorra 10 horas de "arreglarlo después".
- **La comunicación es tanto un estándar técnico como uno personal**: Documentar qué, dónde y por qué hice cada decisión permite que otros entiendan y continúen el trabajo.

**Lo que más me sorprendió:**

- Que la seguridad y la escalabilidad se deciden en la arquitectura inicial, no después
- Que organizar bien a un equipo es más fácil cuando los estándares están claros desde el principio
- Que me disfruto más siendo líder de lo que pensaba

Ahora el equipo tiene:

- Un repositorio limpio, profesional y bien estructurado
- Una infraestructura segura que protege los datos
- Procesos claros (GitFlow, code reviews, pull requests)
- Documentación detallada para que todos entiendan
Estoy aprendiendo, mejorando en organización y flujos de trabajo cada día, y honestamente me encanta lo que estoy logrando.
