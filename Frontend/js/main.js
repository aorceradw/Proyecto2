// Esperamos a que el HTML esté cargado para no tener errores
document.addEventListener('DOMContentLoaded', function() {
    
    const paginaActual = window.location.pathname;

    // --- 1. LÓGICA DE LOGIN (index.html) ---
    if (paginaActual.includes('index.html') || paginaActual === '/') {
        const formularioLogin = document.getElementById('login-form');
        
        if (formularioLogin) {
            formularioLogin.addEventListener('submit', function() {
                const cajaNombre = document.getElementById('usuario').value;
                const cajaRol = document.getElementById('rol').value;
                localStorage.setItem('nombreUsuario', cajaNombre);
                localStorage.setItem('rolUsuario', cajaRol);
            });
        }
    }

    // --- 2. LÓGICA DEL PANEL (dashboard.html) ---
    if (paginaActual.includes('dashboard.html')) {
        const etiquetaNombre = document.querySelector('.user-tag strong');
        const nombreGuardado = localStorage.getItem('nombreUsuario');
        
        if (etiquetaNombre && nombreGuardado) {
            etiquetaNombre.textContent = nombreGuardado.toUpperCase();
        }

        // Cargamos las incidencias al entrar al dashboard
        cargarIncidencias();

        const selectPrioridad = document.getElementById('prioridad');
        const selectEstado = document.getElementById('estado');

        if (selectPrioridad) selectPrioridad.addEventListener('change', cargarIncidencias);
        if (selectEstado) selectEstado.addEventListener('change', cargarIncidencias);

        // Redirección por ID al hacer click en el ojo
        document.addEventListener('click', function(event) {
            const boton = event.target.closest('.btn-view');
            if (!boton) return;
            const fila = boton.closest('tr');
            const idIncidencia = fila.querySelector('.id-text').textContent.replace('#', '');
            window.location.href = 'detalle-incidencias.html?id=' + idIncidencia;
        });
    }

    // --- 3. LÓGICA DE DETALLE (detalle-incidencias.html) ---
    if (paginaActual.includes('detalle-incidencias.html')) {
        const parametrosURL = new URLSearchParams(window.location.search);
        const idRecibido = parametrosURL.get('id');

        if (idRecibido) {
            const spanId = document.querySelector('.incident-id');
            if (spanId) spanId.textContent = '#' + idRecibido;
            cargarDetalleIncidencia(idRecibido);
        }
    }

    // --- 4. LÓGICA DE NUEVA INCIDENCIA (incidencias.html) ---
    if (paginaActual.includes('incidencias.html')) {
        const formulario = document.querySelector('.new-incident-form');
        if (formulario) {
            formulario.addEventListener('submit', async function(event) {
                event.preventDefault();
                await crearIncidencia();
            });
        }
    }
});

// --- FUNCIONES DE FETCH AL BACKEND ---

async function cargarIncidencias() {
    try {
        const selectPrioridad = document.getElementById('prioridad');
        const selectEstado = document.getElementById('estado');

        const prio = selectPrioridad ? selectPrioridad.value : '';
        const est = selectEstado ? selectEstado.value : '';

        let url = '/api/incidencias';
        const params = [];
        if (prio) params.push('prioridad=' + prio);
        if (est) params.push('estado=' + est);
        if (params.length > 0) url += '?' + params.join('&');

        const respuesta = await fetch(url);
        const datos = await respuesta.json();

        if (datos.status === 'success') {
            renderizarTabla(datos.data);
        }
    } catch (error) {
        console.error('Error al cargar incidencias:', error);
    }
}

async function cargarDetalleIncidencia(id) {
    try {
        const respuesta = await fetch('/api/incidencias/' + id);
        const datos = await respuesta.json();

        if (datos && datos.titulo) {
            const titulo = document.querySelector('.incident-info h2');
            if (titulo) titulo.textContent = datos.titulo;

            const descripcion = document.querySelector('.incident-description p');
            if (descripcion) descripcion.textContent = datos.descripcion;
        }
    } catch (error) {
        console.error('Error al cargar detalle:', error);
    }
}

async function crearIncidencia() {
    try {
        const nueva = {
            titulo: document.getElementById('titulo').value,
            descripcion: document.getElementById('descripcion').value,
            prioridad: document.getElementById('prioridad').value,
            reportado_por: localStorage.getItem('nombreUsuario') || 'Anónimo'
        };

        const respuesta = await fetch('/api/incidencias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nueva)
        });

        if (respuesta.ok) {
            window.location.href = 'dashboard.html';
        } else {
            console.error('Error al crear la incidencia');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderizarTabla(incidencias) {
    const tbody = document.querySelector('.table-main tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    incidencias.forEach(function(inc) {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="id-text">#${inc.id}</td>
            <td>${inc.titulo}</td>
            <td><span class="prio-tag">${inc.prioridad}</span></td>
            <td><span class="state-tag">${inc.estado}</span></td>
            <td>
                <button class="btn-view">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(fila);
    });
}