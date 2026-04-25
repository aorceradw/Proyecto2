// ============================================
// FRONTEND/JS/MAIN.JS - Sistema de Incidencias
// Código sencillo para aprender JavaScript
// ============================================

// ============================================
// 1. FUNCIÓN DE LOGIN - Guardar en localStorage
// ============================================

function guardarLogin() {
  // Obtener los valores del formulario
  let cajaUsuario = document.getElementById('usuario');
  let cajaPassword = document.getElementById('password');
  let cajaRol = document.getElementById('rol');

  // Validar que todos los campos tengan algo
  if (!cajaUsuario || !cajaPassword || !cajaRol) {
    return;
  }

  // Cuando clickean el botón de login, guardamos en localStorage
  let formularioLogin = document.getElementById('login-form');
  
  if (formularioLogin) {
    formularioLogin.addEventListener('submit', function(evento) {
      evento.preventDefault(); // No enviar el formulario normal
      
      let nombreUsuario = cajaUsuario.value;
      let rolSeleccionado = cajaRol.value;
      
      // Aquí guardamos en localStorage para que no se pierda al cambiar de página
      localStorage.setItem('usuarioGuardado', nombreUsuario);
      localStorage.setItem('rolGuardado', rolSeleccionado);
      
      console.log('✓ Login guardado: ' + nombreUsuario + ' (' + rolSeleccionado + ')');
      
      // Redirigir al dashboard
      window.location.href = 'pages/dashboard.html';
    });
  }
}

// ============================================
// 2. PERSONALIZAR DASHBOARD CON EL USUARIO
// ============================================

function personalizarDashboard() {
  // Traer el nombre que guardamos en localStorage
  let usuarioGuardado = localStorage.getItem('usuarioGuardado');
  let rolGuardado = localStorage.getItem('rolGuardado');
  
  // Buscar el elemento <strong> que dice "Antonio"
  let etiquetaUsuario = document.querySelector('.user-tag strong');
  let etiquetaCompleta = document.querySelector('.user-tag span');
  
  if (etiquetaUsuario && usuarioGuardado) {
    // Cambiar "Antonio" por el nombre real
    etiquetaUsuario.textContent = usuarioGuardado;
    
    // También cambiar el texto completo con el rol
    if (etiquetaCompleta && rolGuardado) {
      let rolCapitalizado = rolGuardado.charAt(0).toUpperCase() + rolGuardado.slice(1);
      etiquetaCompleta.textContent = 'Hola, ' + usuarioGuardado + ' (' + rolCapitalizado + ')';
    }
  }
}

// ============================================
// 3. FILTROS DE BÚSQUEDA - Detectar cambios
// ============================================

function configuraFiltros() {
  // Buscar el selector que dice "Todos los estados"
  let selectFiltro = document.querySelector('.filter-select');
  
  if (selectFiltro) {
    // Cada vez que cambien el valor, ejecutar esto
    selectFiltro.addEventListener('change', function() {
      let estadoSeleccionado = this.value;
      
      // Mostrar en consola la URL que pediríamos al backend
      if (estadoSeleccionado === 'Todos los estados') {
        console.log('📡 Pidiendo a la API -> /api/incidencias (sin filtros)');
      } else if (estadoSeleccionado === 'Abiertas') {
        console.log('📡 Pidiendo a la API -> /api/incidencias?estado=abierta');
      } else if (estadoSeleccionado === 'Cerradas') {
        console.log('📡 Pidiendo a la API -> /api/incidencias?estado=cerrada');
      }
      
      // Aquí iría el fetch real (por ahora solo en consola)
    });
  }
}

// ============================================
// 4. BOTÓN "VER" - Redirigir con el ID
// ============================================

function configuraBotonesVer() {
  // Buscar todos los botones de "ver" en la tabla
  let botonesVer = document.querySelectorAll('.btn-view');
  
  botonesVer.forEach(function(boton) {
    boton.addEventListener('click', function(evento) {
      evento.preventDefault();
      
      // Obtener la fila del botón
      let fila = this.closest('tr');
      
      // Obtener el ID de la primera columna (ej: "#1024")
      let idTexto = fila.querySelector('.id-text').textContent;
      
      // Remover el # del ID
      let idNumero = idTexto.replace('#', '');
      
      console.log('👁️ Ver detalle de incidencia: ' + idNumero);
      
      // Redirigir a la página de detalle con el ID
      window.location.href = 'detalle-incidencias.html?id=' + idNumero;
    });
  });
}

// ============================================
// 5. DETALLE DE INCIDENCIA - Leer ID de URL
// ============================================

function cargarDetalleIncidencia() {
  // Leer el parámetro "id" de la URL (ej: ?id=1024)
  let parametrosURL = new URLSearchParams(window.location.search);
  let idIncidencia = parametrosURL.get('id');
  
  if (idIncidencia) {
    // Cambiar el ID en la página
    let etiquetaID = document.querySelector('.incident-id');
    if (etiquetaID) {
      etiquetaID.textContent = '#' + idIncidencia;
    }
    
    console.log('📍 Cargando detalle de incidencia ID: ' + idIncidencia);
    
    // Aquí llamaríamos a obtenerDatos(idIncidencia)
    obtenerDatos(idIncidencia);
  }
}

// ============================================
// 6. FUNCIÓN SIMULADA PARA FETCH (Estudiante)
// ============================================

async function obtenerDatos(idIncidencia) {
  try {
    console.log('🔄 Conectando con la API de AWS RDS...');
    console.log('📡 GET http://localhost:8000/api/incidencias/' + idIncidencia);
    
    // Esta es la estructura del fetch real (por ahora solo simulado)
    // const respuesta = await fetch('http://localhost:8000/api/incidencias/' + idIncidencia);
    // const datos = await respuesta.json();
    // console.log('✓ Datos recibidos:', datos);
    
    // Por ahora solo mostramos que tenemos la lógica
    console.log('✓ Función preparada para recibir datos del backend');
    
  } catch (error) {
    console.error('❌ Error al conectar:', error.message);
  }
}

// ============================================
// 7. BOTÓN SALIR - Limpiar localStorage
// ============================================

function configurarSalida() {
  let botonSalir = document.querySelector('.exit-button');
  
  if (botonSalir) {
    botonSalir.addEventListener('click', function(evento) {
      evento.preventDefault();
      
      // Borrar los datos guardados
      localStorage.removeItem('usuarioGuardado');
      localStorage.removeItem('rolGuardado');
      
      console.log('👋 Sesión cerrada');
      
      // Volver a login
      window.location.href = '../index.html';
    });
  }
}

// ============================================
// 8. EJECUTAR CUANDO CARGA LA PÁGINA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Reconocer en qué página estamos
  let rutaActual = window.location.pathname;
  
  // PÁGINA DE LOGIN (index.html)
  if (rutaActual.includes('index.html') || rutaActual === '/') {
    console.log('📄 Página: LOGIN');
    guardarLogin();
  }
  
  // PÁGINA DE DASHBOARD (dashboard.html)
  if (rutaActual.includes('dashboard.html')) {
    console.log('📄 Página: DASHBOARD');
    personalizarDashboard();
    configuraFiltros();
    configuraBotonesVer();
    configurarSalida();
  }
  
  // PÁGINA DE DETALLE (detalle-incidencias.html)
  if (rutaActual.includes('detalle-incidencias.html')) {
    console.log('📄 Página: DETALLE DE INCIDENCIA');
    personalizarDashboard();
    cargarDetalleIncidencia();
    configurarSalida();
  }
});

console.log('✅ main.js cargado');
