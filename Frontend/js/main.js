// Esperamos a que el HTML esté cargado para no tener errores
document.addEventListener('DOMContentLoaded', function() {
    
    // Vemos en qué página estamos para saber qué lógica aplicar
    const paginaActual = window.location.pathname;

    // --- 1. LÓGICA DE LOGIN (index.html) ---
    if (paginaActual.includes('index.html') || paginaActual === '/') {
        const formularioLogin = document.getElementById('login-form');
        
        if (formularioLogin) {
            formularioLogin.addEventListener('submit', function() {
                // Capturamos lo que el usuario escribe
                const cajaNombre = document.getElementById('usuario').value;
                const cajaRol = document.getElementById('rol').value;

                // Guardamos en la "memoria" del navegador (localStorage)
                // Así los datos no se borran al cambiar de página
                localStorage.setItem('nombreUsuario', cajaNombre);
                localStorage.setItem('rolUsuario', cajaRol);
            });
        }
    }

    // --- 2. LÓGICA DEL PANEL (dashboard.html) ---
    if (paginaActual.includes('dashboard.html')) {
        // Cambiamos el nombre estático por el que guardamos en el login
        const etiquetaNombre = document.querySelector('.user-tag strong');
        const nombreGuardado = localStorage.getItem('nombreUsuario');
        
        if (etiquetaNombre && nombreGuardado) {
            etiquetaNombre.textContent = nombreGuardado.toUpperCase();
        }

        // --- UTILIDAD DE BÚSQUEDA Y FILTROS ---
        // Buscamos los selectores que pide la profesora para filtrar
        const selectPrioridad = document.getElementById('prioridad');
        const selectEstado = document.getElementById('estado');

        function realizarBusqueda() {
            const prio = selectPrioridad.value;
            const est = selectEstado.value;

            // Simulamos la consulta dinámica que pide la profesora (Query Parameters)
            console.log("Enviando consulta a la RDS de AWS...");
            console.log("URL generada: http://localhost:8000/incidencias?prioridad=" + prio + "&estado=" + est);
            
            // Aquí iría el fetch real:
            // pedirIncidenciasAlServidor(prio, est);
        }

        // Si cambian los filtros, se "dispara" la búsqueda
        if (selectPrioridad) selectPrioridad.addEventListener('change', realizarBusqueda);
        if (selectEstado) selectEstado.addEventListener('change', realizarBusqueda);

        // --- REDIRECCIÓN POR ID ---
        // Buscamos todos los botones del "ojo" en la tabla
        const botonesVer = document.querySelectorAll('.btn-view');
        botonesVer.forEach(function(boton) {
            boton.addEventListener('click', function(event) {
                // Buscamos la fila donde se hizo click para sacar el ID
                const fila = event.target.closest('tr');
                const idIncidencia = fila.querySelector('.id-text').textContent.replace('#', '');
                
                // Redirigimos usando el ID (Path Parameter)
                window.location.href = 'detalle-incidencias.html?id=' + idIncidencia;
            });
        });
    }

    // --- 3. LÓGICA DE DETALLE (detalle-incidencias.html) ---
    if (paginaActual.includes('detalle-incidencias.html')) {
        // Sacamos el ID de la URL
        const parametrosURL = new URLSearchParams(window.location.search);
        const idRecibido = parametrosURL.get('id');

        if (idRecibido) {
            const spanId = document.querySelector('.incident-id');
            if (spanId) spanId.textContent = '#' + idRecibido;
            console.log("Pidiendo al backend los detalles de la incidencia nº " + idRecibido);
        }
    }
});

// Función básica para el fetch (
async function pedirIncidenciasAlServidor(prio, est) {
    try {
        console.log("Conectando con FastAPI...");
        // let respuesta = await fetch(`http://localhost:8000/incidencias?prioridad=${prio}&estado=${est}`);
        // let datos = await respuesta.json();
    } catch (error) {
        console.log("Error: No se ha podido conectar con la base de datos de AWS");
    }
}