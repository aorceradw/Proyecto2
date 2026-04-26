// === CONFIGURACIÓN Y CONSTANTES ===
const CONFIG = {
    apiUrl: '/api',
    storageKeys: {
        usuario: 'nombreUsuario',
        rol: 'rolUsuario'
    }
};

// === GESTIÓN DE USUARIOS Y SESIÓN ===
const Usuario = {
    obtener: function() {
        return localStorage.getItem(CONFIG.storageKeys.usuario);
    },
    
    obtenerRol: function() {
        return localStorage.getItem(CONFIG.storageKeys.rol);
    },
    
    guardar: function(usuario, rol) {
        if (!usuario || usuario.trim() === '') {
            mostrarError('El nombre de usuario no puede estar vacío');
            return false;
        }
        localStorage.setItem(CONFIG.storageKeys.usuario, usuario.trim());
        localStorage.setItem(CONFIG.storageKeys.rol, rol);
        return true;
    },
    
    limpiar: function() {
        localStorage.removeItem(CONFIG.storageKeys.usuario);
        localStorage.removeItem(CONFIG.storageKeys.rol);
    },
    
    estaAutenticado: function() {
        return !!this.obtener();
    }
};

// === GESTIÓN DE API ===
const API = {
    async fetch(ruta, opciones = {}) {
        try {
            const url = CONFIG.apiUrl + ruta;
            console.log('Llamando API:', url);
            const respuesta = await fetch(url, opciones);
            
            if (!respuesta.ok) {
                throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
            }
            
            return await respuesta.json();
        } catch (error) {
            console.error('Error en API:', error);
            mostrarError('Error al conectar con el servidor');
            throw error;
        }
    },
    
    async obtenerIncidencias(filtros = {}) {
        let ruta = '/incidencias';
        const params = new URLSearchParams();
        
        if (filtros.estado) params.append('estado', filtros.estado);
        if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
        
        if (params.toString()) {
            ruta += '?' + params.toString();
        }
        
        return this.fetch(ruta);
    },
    
    async obtenerIncidencia(id) {
        return this.fetch('/incidencias/' + id);
    },
    
    async crearIncidencia(datos) {
        if (!datos.titulo || !datos.descripcion) {
            throw new Error('Título y descripción son requeridos');
        }
        
        return this.fetch('/incidencias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });
    }
};

// === FUNCIONES DE INTERFAZ ===
function mostrarError(mensaje) {
    console.error(mensaje);
    alert(mensaje);
}

function mostrarExito(mensaje) {
    console.log(mensaje);
}

function obtenerFiltros() {
    const filtros = {};
    
    // Buscar los selects por clase o por name attribute
    const selectEstado = document.querySelector('.filter-select') || document.getElementById('estado');
    const selectPrioridad = document.getElementById('prioridad');
    
    if (selectEstado && selectEstado.value && selectEstado.value !== 'Todos los estados') {
        // Normalizar el valor del estado
        const estado = selectEstado.value.toLowerCase();
        if (estado !== 'todos los estados') {
            filtros.estado = estado;
        }
    }
    if (selectPrioridad && selectPrioridad.value) {
        filtros.prioridad = selectPrioridad.value;
    }
    
    return filtros;
}

async function cargarIncidencias(desde = 0) {
    try {
        const filtros = obtenerFiltros();
        let datos = await API.obtenerIncidencias(filtros);
        
        // Manejar diferentes formatos de respuesta
        let incidencias = [];
        if (datos && Array.isArray(datos.data)) {
            incidencias = datos.data;
        } else if (Array.isArray(datos)) {
            incidencias = datos;
        } else {
            console.error('Formato de respuesta no esperado:', datos);
            incidencias = [];
        }
        
        // Filtrar por búsqueda si existe
        const inputBusqueda = document.querySelector('input[placeholder*="Buscar"]');
        if (inputBusqueda && inputBusqueda.value.trim()) {
            const termino = inputBusqueda.value.toLowerCase();
            incidencias = incidencias.filter(inc => {
                const id = String(inc.id).toLowerCase();
                const titulo = (inc.titulo || '').toLowerCase();
                return id.includes(termino) || titulo.includes(termino);
            });
        }
        
        renderizarTabla(incidencias);
        actualizarEstadisticas(incidencias);
        
    } catch (error) {
        console.error('Error al cargar incidencias:', error);
        mostrarError('No se pudieron cargar las incidencias');
    }
}

function renderizarTabla(incidencias) {
    const tbody = document.querySelector('.table-main tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!incidencias || incidencias.length === 0) {
        const fila = document.createElement('tr');
        fila.innerHTML = '<td colspan="5" style="text-align: center; padding: 20px; color: #999;">No hay incidencias que mostrar</td>';
        tbody.appendChild(fila);
        return;
    }
    
    incidencias.forEach(function(incidencia) {
        const fila = document.createElement('tr');
        const prioridad = (incidencia.prioridad || 'media').toLowerCase();
        const estado = (incidencia.estado || 'abierta').toLowerCase();
        
        // Determinar clase CSS para prioridad
        let clasePrio = 'mid';
        if (prioridad.includes('alta') || prioridad.includes('high')) clasePrio = 'high';
        if (prioridad.includes('baja') || prioridad.includes('low')) clasePrio = 'low';
        
        // Determinar clase CSS para estado
        let claseEstado = 'open';
        if (estado.includes('cerrada') || estado.includes('closed')) claseEstado = 'closed';
        if (estado.includes('progreso') || estado.includes('progress')) claseEstado = 'progress';
        
        fila.innerHTML = `
            <td class="id-text">#${incidencia.id}</td>
            <td>${incidencia.titulo || 'Sin título'}</td>
            <td><span class="prio-tag ${clasePrio}">${incidencia.prioridad || 'Media'}</span></td>
            <td><span class="state-tag ${claseEstado}">${incidencia.estado || 'Abierta'}</span></td>
            <td>
                <button class="btn-view" data-id="${incidencia.id}" type="button">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
    
    // Actualizar información de paginación
    const footer = document.querySelector('.card-footer p');
    if (footer) {
        footer.textContent = `Mostrando ${incidencias.length} incidencias`;
    }
}

function actualizarEstadisticas(incidencias) {
    // Calcular estadísticas
    const total = incidencias.length;
    const abiertas = incidencias.filter(inc => 
        (inc.estado || '').toLowerCase().includes('abierta')
    ).length;
    const criticas = incidencias.filter(inc => 
        (inc.prioridad || '').toLowerCase().includes('alta')
    ).length;
    
    // Actualizar elementos
    const stats = document.querySelectorAll('.stat-item .value');
    if (stats.length >= 3) {
        stats[0].textContent = total;
        stats[1].textContent = abiertas;
        stats[2].textContent = criticas;
    }
}

async function cargarDetalleIncidencia(id) {
    try {
        const datos = await API.obtenerIncidencia(id);
        
        if (datos) {
            // Actualizar título
            const titulo = document.querySelector('.incident-info h2');
            if (titulo) titulo.textContent = datos.titulo || 'Sin título';
            
            // Actualizar descripción
            const descripcion = document.querySelector('.incident-description p');
            if (descripcion) descripcion.textContent = datos.descripcion || 'Sin descripción';
            
            // Actualizar otros campos si existen
            const prioridad = document.querySelector('.incident-priority');
            if (prioridad) prioridad.textContent = datos.prioridad || 'Normal';
            
            const estado = document.querySelector('.incident-state');
            if (estado) estado.textContent = datos.estado || 'Abierta';
            
            const reportadoPor = document.querySelector('.incident-reporter');
            if (reportadoPor) reportadoPor.textContent = datos.reportado_por || 'Desconocido';
            
            mostrarExito('Incidencia cargada correctamente');
        }
    } catch (error) {
        console.error('Error al cargar detalle:', error);
        mostrarError('No se pudo cargar el detalle de la incidencia');
    }
}

async function crearIncidencia(event) {
    try {
        event.preventDefault();
        
        const datos = {
            titulo: document.getElementById('titulo')?.value,
            descripcion: document.getElementById('descripcion')?.value,
            prioridad: document.getElementById('prioridad')?.value || 'media',
            reportado_por: Usuario.obtener() || 'Anónimo'
        };
        
        // Validar campos
        if (!datos.titulo || !datos.descripcion) {
            mostrarError('Por favor completa todos los campos requeridos');
            return;
        }
        
        await API.crearIncidencia(datos);
        mostrarExito('Incidencia creada correctamente');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 500);
    } catch (error) {
        console.error('Error al crear incidencia:', error);
        mostrarError('Error al crear la incidencia');
    }
}

function personalizarDashboard() {
    const usuario = Usuario.obtener();
    const rol = Usuario.obtenerRol();
    
    if (!usuario) {
        window.location.href = '../index.html';
        return;
    }
    
    const etiquetaNombre = document.querySelector('.user-tag strong');
    if (etiquetaNombre) {
        etiquetaNombre.textContent = usuario.toUpperCase();
    }
    
    const etiquetaSpan = document.querySelector('.user-tag span');
    if (etiquetaSpan && rol) {
        etiquetaSpan.innerHTML = `Hola, <strong>${usuario}</strong> (${rol})`;
    }
}

function configurarBotonesBusqueda() {
    // Configurar filtro por estado
    const selectEstado = document.querySelector('.filter-select') || document.getElementById('estado');
    if (selectEstado) {
        selectEstado.addEventListener('change', function() {
            console.log('Filtro de estado cambiado:', this.value);
            cargarIncidencias();
        });
    }
    
    // Configurar filtro por prioridad
    const selectPrioridad = document.getElementById('prioridad');
    if (selectPrioridad) {
        selectPrioridad.addEventListener('change', function() {
            console.log('Filtro de prioridad cambiado:', this.value);
            cargarIncidencias();
        });
    }
    
    // Configurar búsqueda por ID o título
    const inputBusqueda = document.querySelector('input[placeholder*="Buscar"]');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', function() {
            console.log('Búsqueda:', this.value);
            cargarIncidencias();
        });
    }
}

function configurarBotonesVer() {
    document.addEventListener('click', function(event) {
        const boton = event.target.closest('.btn-view');
        if (!boton) return;
        
        const id = boton.getAttribute('data-id');
        if (id) {
            console.log('Abriendo incidencia:', id);
            window.location.href = 'detalle-incidencias.html?id=' + id;
        }
    });
}

function configurarSalida() {
    const botonSalida = document.querySelector('.exit-button');
    if (botonSalida) {
        botonSalida.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Cerrando sesión');
            Usuario.limpiar();
            window.location.href = '../index.html';
        });
    }
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada');
    const paginaActual = window.location.pathname;
    
    // Detectar qué página estamos visitando y ejecutar lógica correspondiente
    if (paginaActual.includes('index.html') || paginaActual === '/' || paginaActual.endsWith('/')) {
        // PÁGINA DE LOGIN
        console.log('Inicializando página de login');
        const formularioLogin = document.getElementById('login-form');
        if (formularioLogin) {
            formularioLogin.addEventListener('submit', function(event) {
                event.preventDefault();
                const usuario = document.getElementById('usuario')?.value;
                const rol = document.getElementById('rol')?.value;
                
                if (Usuario.guardar(usuario, rol)) {
                    console.log('Rediriendo al dashboard');
                    window.location.href = 'pages/dashboard.html';
                }
            });
        }
    } 
    else if (paginaActual.includes('dashboard.html')) {
        // PÁGINA DE DASHBOARD
        console.log('Inicializando dashboard');
        if (!Usuario.estaAutenticado()) {
            window.location.href = '../index.html';
            return;
        }
        
        personalizarDashboard();
        configurarBotonesBusqueda();
        configurarBotonesVer();
        configurarSalida();
        
        // Cargar incidencias al entrar
        cargarIncidencias();
    } 
    else if (paginaActual.includes('detalle-incidencias.html')) {
        // PÁGINA DE DETALLE
        console.log('Inicializando detalle de incidencia');
        if (!Usuario.estaAutenticado()) {
            window.location.href = '../index.html';
            return;
        }
        
        personalizarDashboard();
        configurarSalida();
        
        const parametrosURL = new URLSearchParams(window.location.search);
        const idIncidencia = parametrosURL.get('id');
        
        if (idIncidencia) {
            const spanId = document.querySelector('.incident-id');
            if (spanId) spanId.textContent = '#' + idIncidencia;
            cargarDetalleIncidencia(idIncidencia);
        } else {
            mostrarError('No se especificó una incidencia');
            window.location.href = 'dashboard.html';
        }
    } 
    else if (paginaActual.includes('incidencias.html') || paginaActual.includes('registro.html')) {
        // PÁGINA DE CREAR INCIDENCIA
        console.log('Inicializando página de crear incidencia');
        if (!Usuario.estaAutenticado()) {
            window.location.href = '../index.html';
            return;
        }
        
        personalizarDashboard();
        configurarSalida();
        
        const formulario = document.querySelector('.new-incident-form');
        if (formulario) {
            formulario.addEventListener('submit', crearIncidencia);
        }
    }
});