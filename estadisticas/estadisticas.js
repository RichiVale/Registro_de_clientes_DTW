// Crear Web Worker para procesar metricas del dashboard
const workerBlob = new Blob([`
    function calcularEstadisticas(pedidos) {
        let totalVendido = 0;
        let totalPupusasVendidas = 0;
        let ventasPorPupusa = {};

        pedidos.forEach(pedido => {
            totalVendido += Number(pedido.total) || 0;
            totalPupusasVendidas += Number(pedido.totalPupusas) || 0;

            pedido.items.forEach(item => {
                if (!ventasPorPupusa[item.nombre]) {
                    ventasPorPupusa[item.nombre] = {
                        cantidad: 0,
                        total: 0
                    };
                }

                ventasPorPupusa[item.nombre].cantidad += Number(item.cantidad) || 0;
                ventasPorPupusa[item.nombre].total += Number(item.subtotal) || 0;
            });
        });

        let pupusaMasVendida = null;
        let cantidadMasVendida = 0;

        for (const [nombre, datos] of Object.entries(ventasPorPupusa)) {
            if (datos.cantidad > cantidadMasVendida) {
                cantidadMasVendida = datos.cantidad;
                pupusaMasVendida = nombre;
            }
        }

        return {
            totalVendido,
            totalPupusasVendidas,
            pupusaMasVendida: pupusaMasVendida || 'Ninguna',
            cantidadMasVendida,
            ventasPorPupusa
        };
    }

    self.onmessage = function(e) {
        try {
            const pedidos = e.data.pedidos || [];
            const estadisticas = calcularEstadisticas(pedidos);
            self.postMessage({ ok: true, estadisticas });
        } catch (error) {
            self.postMessage({ ok: false, mensaje: error.message });
        }
    };
`], { type: 'application/javascript' });

const workerUrl = URL.createObjectURL(workerBlob);
const worker = new Worker(workerUrl);

function leerJsonLocalStorage(clave, valorPorDefecto) {
    try {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : valorPorDefecto;
    } catch (error) {
        console.error('Error leyendo localStorage:', error);
        return valorPorDefecto;
    }
}

function cargarEstadisticas() {
    try {
        const pedidosEntregados = leerJsonLocalStorage('pedidos_entregados', []);
        const pedidosPendientes = leerJsonLocalStorage('pedidos_pendientes', []);

        document.getElementById('totalRegistros').textContent = pedidosEntregados.length + pedidosPendientes.length;
        document.getElementById('totalPendientes').textContent = pedidosPendientes.length;
        document.getElementById('totalEntregados').textContent = pedidosEntregados.length;

        worker.postMessage({ pedidos: pedidosEntregados });
    } catch (error) {
        console.error('Error cargando estadisticas:', error);
        mostrarErrorEstadisticas();
    }
}

worker.onmessage = function(e) {
    if (!e.data.ok) {
        console.error('Error en Web Worker:', e.data.mensaje);
        mostrarErrorEstadisticas();
        return;
    }

    const stats = e.data.estadisticas;
    document.getElementById('totalVendido').textContent = stats.totalVendido.toFixed(2);
    document.getElementById('totalPupusasVendidas').textContent = stats.totalPupusasVendidas;
    document.getElementById('pupusaMasVendida').textContent = stats.pupusaMasVendida;
    document.getElementById('cantidadMasVendida').textContent = stats.cantidadMasVendida;

    mostrarTablaVentas(stats.ventasPorPupusa);
};

function mostrarErrorEstadisticas() {
    document.getElementById('totalRegistros').textContent = '0';
    document.getElementById('totalPendientes').textContent = '0';
    document.getElementById('totalEntregados').textContent = '0';
    document.getElementById('totalVendido').textContent = '0.00';
    document.getElementById('totalPupusasVendidas').textContent = '0';
    document.getElementById('pupusaMasVendida').textContent = 'Error';
    document.getElementById('cantidadMasVendida').textContent = '0';
    document.getElementById('cuerpoTablaVentas').innerHTML = '<tr><td colspan="3">No se pudieron cargar las estadisticas</td></tr>';
}

function mostrarTablaVentas(ventasPorPupusa) {
    const tbody = document.getElementById('cuerpoTablaVentas');
    tbody.innerHTML = '';

    const ventasArray = [];
    for (const [nombre, datos] of Object.entries(ventasPorPupusa)) {
        ventasArray.push({
            nombre: nombre,
            cantidad: datos.cantidad,
            total: datos.total
        });
    }

    ventasArray.sort((a, b) => b.cantidad - a.cantidad);

    if (ventasArray.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3">No hay ventas registradas</td></tr>';
        return;
    }

    for (let i = 0; i < ventasArray.length; i++) {
        const venta = ventasArray[i];
        const fila = tbody.insertRow();
        fila.insertCell(0).textContent = venta.nombre;
        fila.insertCell(1).textContent = venta.cantidad;
        fila.insertCell(2).textContent = '$' + venta.total.toFixed(2);
    }
}

function cargarDatosApiConGeolocalizacion() {
    const estadoApi = document.getElementById('estadoApi');

    if (!navigator.geolocation) {
        estadoApi.textContent = 'Geolocalizacion no soportada por el navegador';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        function(posicion) {
            const latitud = posicion.coords.latitude;
            const longitud = posicion.coords.longitude;

            document.getElementById('latitud').textContent = latitud.toFixed(5);
            document.getElementById('longitud').textContent = longitud.toFixed(5);
            obtenerClima(latitud, longitud);
        },
        function(error) {
            console.error('Error de geolocalizacion:', error);
            estadoApi.textContent = 'No se pudo obtener la ubicacion';
        }
    );
}

async function obtenerClima(latitud, longitud) {
    const estadoApi = document.getElementById('estadoApi');

    try {
        estadoApi.textContent = 'Consultando API REST...';

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitud}&longitude=${longitud}&current=temperature_2m,weather_code&timezone=auto`;
        const respuesta = await fetch(url);

        if (!respuesta.ok) {
            throw new Error('La API respondio con estado ' + respuesta.status);
        }

        const datos = await respuesta.json();
        document.getElementById('temperaturaActual').textContent = datos.current.temperature_2m + ' ' + datos.current_units.temperature_2m;
        document.getElementById('codigoClima').textContent = datos.current.weather_code;
        estadoApi.textContent = 'Datos cargados correctamente';
    } catch (error) {
        console.error('Error consumiendo API REST:', error);
        estadoApi.textContent = 'No se pudieron cargar los datos de la API';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cargarEstadisticas();
    cargarDatosApiConGeolocalizacion();
});
