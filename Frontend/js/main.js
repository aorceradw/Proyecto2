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
    
    const selectPrioridad = document.getElementById('prioridad');
    const selectEstado = document.getElementById('estado');
    
    if (selectPrioridad && selectPrioridad.value) {
        filtros.prioridad = selectPrioridad.value;
    }
    if (selectEstado && selectEstado.value) {
        filtros.estado = selectEstado.value;
    }
    
    return filtros;
}

async function cargarIncidencias() {
    try {
        const filtros = obtenerFiltros();
        const datos = await API.obtenerIncidencias(filtros);
        
        if (datos && Array.isArray(datos.data)) {
            renderizarTabla(datos.data);
        } else if (Array.isArray(datos)) {
            renderizarTabla(datos);
        } else {
            mostrarError('Formato de respuesta inválido');
        }
    } catch (error) {
        mostrarError('No se pudieron cargar las incidencias');
    }
}

function renderizarTabla(incidencias) {
    const tbody = document.querySelector('.table-main tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (!incidencias || incidencias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No hay incidencias</td></tr>';
        return;
    }
    
    incidencias.forEach(function(incidencia) {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="id-text">#${incidencia.id}</td>
            <td>${incidencia.titulo || 'Sin título'}</td>
            <td><span class="prio-tag">${incidencia.prioridad || 'normal'}</span></td>
            <td><span class="state-tag">${incidencia.estado || 'abierta'}</span></td>
            <td>
                <button class="btn-view" data-id="${incidencia.id}" type="button">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
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
            if (prioridad) prioridad.textContent = datos.prioridad || 'normal';
            
            const estado = document.querySelector('.incident-state');
            if (estado) estado.textContent = datos.estado || 'abierta';
            
            mostrarExito('Incidencia cargada correctamente');
        }
    } catch (error) {
        mostrarError('No se pudo cargar el detalle de la incidencia');
    }
}

async function crearIncidencia(event) {
    try {
        event.preventDefault();
        
        const datos = {
            titulo: document.getElementById('titulo')?.value,
            descripcion: document.getElementById('descripcion')?.value,
            prioridad: document.getElementById('prioridad')?.value || 'normal',
            reportado_por: Usuario.obtener() || 'Anónimo'
        };
        
        await API.crearIncidencia(datos);
        mostrarExito('Incidencia creada correctamente');
        window.location.href = 'dashboard.html';
    } catch (error) {
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
    
    const etiquetaRol = document.querySelector('.user-tag span');
    if (etiquetaRol && rol) {
        etiquetaRol.textContent = `Hola, ${usuario} (${rol})`;
    }
}

function configurarBotonesBusqueda() {
    const selectPrioridad = document.getElementById('prioridad');
    const selectEstado = document.getElementById('estado');
    
    if (selectPrioridad) {
        selectPrioridad.addEventListener('change', cargarIncidencias);
    }
    if (selectEstado) {
        selectEstado.addEventListener('change', cargarIncidencias);
    }
}

function configurarBotonesVer() {
    document.addEventListener('click', function(event) {
        const boton = event.target.closest('.btn-view');
        if (!boton) return;
        
        const id = boton.getAttribute('data-id');
        if (id) {
            window.location.href = 'detalle-incidencias.html?id=' + id;
        }
    });
}

function configurarSalida() {
    const botonSalida = document.querySelector('.exit-button');
    if (botonSalida) {
        botonSalida.addEventListener('click', function(event) {
            event.preventDefault();
            Usuario.limpiar();
            window.location.href = '../index.html';
        });
    }
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function() {
    const paginaActual = window.location.pathname;
    
    // Detectar qué página estamos visitando y ejecutar lógica correspondiente
    if (paginaActual.includes('index.html') || paginaActual === '/' || paginaActual.endsWith('/')) {
        // PÁGINA DE LOGIN
        const formularioLogin = document.getElementById('login-form');
        if (formularioLogin) {
            formularioLogin.addEventListener('submit', function(event) {
                event.preventDefault();
                const usuario = document.getElementById('usuario')?.value;
                const rol = document.getElementById('rol')?.value;
                
                if (Usuario.guardar(usuario, rol)) {
                    window.location.href = 'pages/dashboard.html';
                }
            });
        }
    } 
    else if (paginaActual.includes('dashboard.html')) {
        // PÁGINA DE DASHBOARD
        if (!Usuario.estaAutenticado()) {
            window.location.href = '../index.html';
            return;
        }
        
        personalizarDashboard();
        cargarIncidencias();
        configurarBotonesBusqueda();
        configurarBotonesVer();
        configurarSalida();
    } 
    else if (paginaActual.includes('detalle-incidencias.html')) {
        // PÁGINA DE DETALLE
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
    else if (paginaActual.includes('incidencias.html')) {
        // PÁGINA DE CREAR INCIDENCIA
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