// js/cargarNavegacion.js
function cargarNavegacion() {
    let rutaBase = '';
    const pathActual = window.location.pathname;

    if (pathActual.includes('/ordenar/') ||
        pathActual.includes('/pendiente-ticket/') ||
        pathActual.includes('/entregado-ticket/') ||
        pathActual.includes('/pedidos-borrados/') ||
        pathActual.includes('/estadisticas/') ||
        pathActual.includes('/clientes/') ||
        pathActual.includes('/menu/')
    ) {
        rutaBase = '../';
    }

    fetch(rutaBase + 'navegacion/navegacion.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar la navegacion');
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('navegacion').innerHTML = data;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('navegacion').innerHTML = `
                <style>
                    .navbar {
                        display: flex;
                        flex-wrap: wrap;
                        align-items: center;
                        gap: 10px;
                        padding: 14px 18px;
                        margin-bottom: 24px;
                        background: #243447;
                        border-radius: 8px;
                        box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    .navbar a {
                        color: #ffffff;
                        text-decoration: none;
                        padding: 9px 12px;
                        border-radius: 6px;
                        font-size: 15px;
                        font-weight: 600;
                    }

                    .navbar a:hover {
                        background: #f2c94c;
                        color: #1f2933;
                    }

                    @media (max-width: 600px) {
                        .navbar {
                            flex-direction: column;
                            align-items: stretch;
                        }

                        .navbar a {
                            text-align: center;
                        }
                    }
                </style>

                <div class="navbar">
                    <a href="${rutaBase}menu/index.html">Inicio</a>
                    <a href="${rutaBase}ordenar/index.html">Ordenar</a>
                    <a href="${rutaBase}clientes/index.html">Clientes</a>
                    <a href="${rutaBase}pendiente-ticket/index.html">Pedidos Pendientes</a>
                    <a href="${rutaBase}entregado-ticket/index.html">Pedidos Entregados</a>
                    <a href="${rutaBase}pedidos-borrados/index.html">Pedidos Borrados</a>
                    <a href="${rutaBase}estadisticas/index.html">Estadisticas</a>
                </div>
            `;
        });
}

// Auto-ejecutar cuando la pagina cargue
document.addEventListener('DOMContentLoaded', cargarNavegacion);
