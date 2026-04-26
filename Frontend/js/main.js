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

        if (filtros.estado)    params.append('estado', filtros.estado);
        if (filtros.prioridad) params.append('prioridad', filtros.prioridad);

        if (params.toString()) ruta += '?' + params.toString();

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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
    }
};

// === FUNCIONES DE INTERFAZ ===
function mostrarError(mensaje) {
    console.error(mensaje);
    alert('❌ ' + mensaje);
}

function mostrarExito(mensaje) {
    console.log(mensaje);
    alert('✅ ' + mensaje);
}

// === DASHBOARD: cargar y renderizar incidencias ===
function obtenerFiltros() {
    const filtros = {};

    const selectEstado    = document.getElementById('filtro-estado');
    const selectPrioridad = document.getElementById('filtro-prioridad');

    if (selectEstado && selectEstado.value)    filtros.estado    = selectEstado.value;
    if (selectPrioridad && selectPrioridad.value) filtros.prioridad = selectPrioridad.value;

    return filtros;
}

async function cargarIncidencias() {
    try {
        const filtros = obtenerFiltros();
        let datos = await API.obtenerIncidencias(filtros);

        // El back puede devolver array directo o { status, data: [...] }
        let incidencias = [];
        if (datos && Array.isArray(datos.data)) {
            incidencias = datos.data;
        } else if (Array.isArray(datos)) {
            incidencias = datos;
        } else {
            console.error('Formato de respuesta no esperado:', datos);
        }

        // Filtro local por texto de búsqueda
        const inputBusqueda = document.querySelector('input[placeholder*="Buscar"]');
        if (inputBusqueda && inputBusqueda.value.trim()) {
            const termino = inputBusqueda.value.toLowerCase();
            incidencias = incidencias.filter(inc =>
                String(inc.id).includes(termino) ||
                (inc.titulo || '').toLowerCase().includes(termino)
            );
        }

        renderizarTabla(incidencias);
        actualizarEstadisticas(incidencias);

    } catch (error) {
        console.error('Error al cargar incidencias:', error);
    }
}

function renderizarTabla(incidencias) {
    const tbody = document.getElementById('tabla-incidencias');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!incidencias || incidencias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#999;">No hay incidencias que mostrar</td></tr>';
        return;
    }

    incidencias.forEach(function(inc) {
        const prioridad = (inc.prioridad || 'media').toLowerCase();
        const estado    = (inc.estado    || 'abierta').toLowerCase();

        // Clase CSS para prioridad
        let clasePrio = 'mid';
        if (prioridad === 'alta')  clasePrio = 'high';
        if (prioridad === 'baja')  clasePrio = 'low';

        // Clase CSS para estado
        let claseEstado = 'open';
        if (estado === 'cerrada') claseEstado = 'closed';

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="id-text">#${inc.id}</td>
            <td>${inc.titulo || 'Sin título'}</td>
            <td><span class="prio-tag ${clasePrio}">${inc.prioridad || 'Media'}</span></td>
            <td><span class="state-tag ${claseEstado}">${inc.estado || 'Abierta'}</span></td>
            <td>
                <button class="btn-view" data-id="${inc.id}" type="button">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });

    // Actualizar contador en el footer
    const infoPag = document.getElementById('info-paginacion');
    if (infoPag) infoPag.textContent = `Mostrando ${incidencias.length} incidencia(s)`;
}

function actualizarEstadisticas(incidencias) {
    const total    = incidencias.length;
    const abiertas = incidencias.filter(i => (i.estado || '').toLowerCase() === 'abierta').length;
    const criticas = incidencias.filter(i => (i.prioridad || '').toLowerCase() === 'alta').length;

    const elTotal    = document.getElementById('stat-total');
    const elAbiertas = document.getElementById('stat-abiertas');
    const elCriticas = document.getElementById('stat-criticas');

    if (elTotal)    elTotal.textContent    = total;
    if (elAbiertas) elAbiertas.textContent = abiertas;
    if (elCriticas) elCriticas.textContent = criticas;
}

// === DETALLE: cargar una incidencia por ID ===
async function cargarDetalleIncidencia(id) {
    try {
        let datos = await API.obtenerIncidencia(id);

        // El back puede devolver el objeto directo o envuelto en { data: ... }
        const inc = datos.data || datos;

        if (!inc) {
            mostrarError('No se encontraron datos para esta incidencia');
            return;
        }

        const prioridad = (inc.prioridad || 'media').toLowerCase();
        const estado    = (inc.estado    || 'abierta').toLowerCase();

        // Rellenar cabecera
        const elTitulo = document.getElementById('detalle-titulo');
        if (elTitulo) elTitulo.textContent = inc.titulo || 'Sin título';

        const elId = document.getElementById('detalle-id');
        if (elId) elId.textContent = '#' + inc.id;

        // Badges de prioridad y estado
        const badgePrio = document.getElementById('detalle-prioridad-badge');
        if (badgePrio) {
            badgePrio.textContent = inc.prioridad || 'Media';
            badgePrio.className = 'prio-tag ' + (prioridad === 'alta' ? 'high' : prioridad === 'baja' ? 'low' : 'mid');
        }

        const badgeEstado = document.getElementById('detalle-estado-badge');
        if (badgeEstado) {
            badgeEstado.textContent = inc.estado || 'Abierta';
            badgeEstado.className = 'state-tag ' + (estado === 'cerrada' ? 'closed' : 'open');
        }

        // Grid de detalles — IDs que el JS del detalle busca
        const elReporter  = document.getElementById('incident-reporter');
        const elPriority  = document.getElementById('incident-priority');
        const elState     = document.getElementById('incident-state');
        const elIdField   = document.getElementById('incident-id-field');

        if (elReporter)  elReporter.textContent  = inc.reportado_por || 'Desconocido';
        if (elPriority)  elPriority.textContent  = inc.prioridad     || 'Media';
        if (elState)     elState.textContent      = inc.estado        || 'Abierta';
        if (elIdField)   elIdField.textContent    = '#' + inc.id;

        // Descripción
        const elDesc = document.getElementById('detalle-descripcion');
        if (elDesc) elDesc.textContent = inc.descripcion || 'Sin descripción';

    } catch (error) {
        console.error('Error al cargar detalle:', error);
        mostrarError('No se pudo cargar el detalle de la incidencia');
    }
}

// === CREAR INCIDENCIA (formulario de incidencias.html) ===
async function crearIncidencia(event) {
    event.preventDefault();

    const datos = {
        titulo:       document.getElementById('titulo')?.value?.trim(),
        descripcion:  document.getElementById('descripcion')?.value?.trim(),
        prioridad:    document.getElementById('prioridad')?.value || 'media',
        reportado_por: Usuario.obtener() || 'Anónimo'
    };

    if (!datos.titulo || !datos.descripcion) {
        mostrarError('Por favor completa todos los campos requeridos');
        return;
    }

    try {
        await API.crearIncidencia(datos);
        mostrarExito('Incidencia creada correctamente');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } catch (error) {
        console.error('Error al crear incidencia:', error);
        mostrarError('Error al crear la incidencia. ¿Está el backend funcionando?');
    }
}

// === REGISTRO (registro.html) ===
function configurarRegistro() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const usuario  = document.getElementById('new-user')?.value?.trim();
        const pass1    = document.getElementById('new-password')?.value;
        const pass2    = document.getElementById('confirm-password')?.value;
        const rol      = document.getElementById('rol-registro')?.value;

        if (!usuario || !pass1 || !rol) {
            mostrarError('Por favor completa todos los campos');
            return;
        }

        if (pass1 !== pass2) {
            mostrarError('Las contraseñas no coinciden');
            return;
        }

        // Sin backend de usuarios: guardamos en localStorage y redirigimos
        if (Usuario.guardar(usuario, rol)) {
            mostrarExito('Cuenta creada. Redirigiendo al panel...');
            setTimeout(() => { window.location.href = '../index.html'; }, 800);
        }
    });
}

// === UTILIDADES COMUNES ===
function personalizarNavbar() {
    const usuario = Usuario.obtener();
    const rol     = Usuario.obtenerRol();

    const elNombre = document.getElementById('nombre-usuario');
    const elRol    = document.getElementById('rol-usuario');

    if (elNombre) elNombre.textContent = usuario || '?';
    if (elRol)    elRol.textContent    = rol     || '?';
}

function configurarSalida() {
    const botonSalida = document.querySelector('.exit-button');
    if (!botonSalida) return;

    botonSalida.addEventListener('click', function(event) {
        event.preventDefault();
        Usuario.limpiar();
        // Desde pages/ hay que subir un nivel
        const esSubpagina = window.location.pathname.includes('/pages/');
        window.location.href = esSubpagina ? '../index.html' : 'index.html';
    });
}

function configurarFiltrosDashboard() {
    const selectEstado    = document.getElementById('filtro-estado');
    const selectPrioridad = document.getElementById('filtro-prioridad');
    const inputBusqueda   = document.querySelector('input[placeholder*="Buscar"]');

    if (selectEstado)    selectEstado.addEventListener('change',  cargarIncidencias);
    if (selectPrioridad) selectPrioridad.addEventListener('change', cargarIncidencias);
    if (inputBusqueda)   inputBusqueda.addEventListener('input',   cargarIncidencias);
}

function configurarBotonesVer() {
    // Delegación de eventos: funciona aunque el tbody se renderice después
    document.addEventListener('click', function(event) {
        const boton = event.target.closest('.btn-view');
        if (!boton) return;

        const id = boton.getAttribute('data-id');
        if (id) window.location.href = 'detalle-incidencias.html?id=' + id;
    });
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', function() {
    const ruta = window.location.pathname;
    console.log('Página actual:', ruta);

    // ── LOGIN (index.html) ────────────────────────────────────
    if (ruta.includes('index.html') || ruta === '/' || ruta.endsWith('/Frontend/')) {
        const formLogin = document.getElementById('login-form');
        if (formLogin) {
            formLogin.addEventListener('submit', function(event) {
                event.preventDefault();
                const usuario = document.getElementById('usuario')?.value;
                const rol     = document.getElementById('rol')?.value;

                if (Usuario.guardar(usuario, rol)) {
                    window.location.href = 'pages/dashboard.html';
                }
            });
        }
    }

    // ── DASHBOARD ─────────────────────────────────────────────
    else if (ruta.includes('dashboard.html')) {
        if (!Usuario.estaAutenticado()) {
            window.location.href = '../index.html';
            return;
        }
        personalizarNavbar();
        configurarSalida();
        configurarFiltrosDashboard();
        configurarBotonesVer();
        cargarIncidencias();
    }

    // ── DETALLE ───────────────────────────────────────────────
    else if (ruta.includes('detalle-incidencias.html')) {
        if (!Usuario.estaAutenticado()) {
            window.location.href = '../index.html';
            return;
        }
        personalizarNavbar();
        configurarSalida();

        const params = new URLSearchParams(window.location.search);
        const id     = params.get('id');

        if (id) {
            cargarDetalleIncidencia(id);
        } else {
            mostrarError('No se especificó ninguna incidencia');
            window.location.href = 'dashboard.html';
        }
    }

    // ── NUEVA INCIDENCIA ──────────────────────────────────────
    else if (ruta.includes('incidencias.html')) {
        if (!Usuario.estaAutenticado()) {
            window.location.href = '../index.html';
            return;
        }
        personalizarNavbar();
        configurarSalida();

        const form = document.getElementById('form-nueva-incidencia');
        if (form) form.addEventListener('submit', crearIncidencia);
    }

    // ── REGISTRO ──────────────────────────────────────────────
    else if (ruta.includes('registro.html')) {
        configurarRegistro();
    }
});