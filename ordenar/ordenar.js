// Variable global para almacenar las pupusas y el pedido actual
let pupusas = [];
let pedidoActual = {};

function cargarPupusas() {
    try {
        const pupusasGuardadas = localStorage.getItem('pupusas');

        if (pupusasGuardadas) {
            pupusas = JSON.parse(pupusasGuardadas);
        } else {
            pupusas = [
                { id: 1, nombre: 'Queso', precio: 0.35 },
                { id: 2, nombre: 'Frijol', precio: 0.35 },
                { id: 3, nombre: 'Revueltas', precio: 0.35 },
                { id: 4, nombre: 'Chicharron', precio: 0.35 },
                { id: 5, nombre: 'Ayote', precio: 0.35 }
            ];
        }

        mostrarTabla();
    } catch (error) {
        console.error('Error cargando pupusas:', error);
        alert('No se pudieron cargar las pupusas.');
    }
}

function mostrarTabla() {
    const tbody = document.getElementById('cuerpoPedido');
    tbody.innerHTML = '';

    for (let i = 0; i < pupusas.length; i++) {
        const pupusa = pupusas[i];
        const cantidad = pedidoActual[pupusa.id] || 0;
        const subtotal = calcularSubtotal(pupusa, cantidad);
        const fila = tbody.insertRow();

        fila.insertCell(0).textContent = pupusa.nombre + ' ($' + pupusa.precio.toFixed(2) + ')';
        fila.insertCell(1).textContent = '$' + subtotal.toFixed(2);

        const celdaCantidad = fila.insertCell(2);
        const btnRestar = document.createElement('button');
        btnRestar.textContent = '-';
        btnRestar.onclick = function() {
            cambiarCantidad(pupusa.id, -1);
        };

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'text';
        inputCantidad.value = cantidad;
        inputCantidad.style.width = '50px';
        inputCantidad.style.textAlign = 'center';
        inputCantidad.readOnly = true;
        inputCantidad.id = 'cantidad_' + pupusa.id;

        const btnSumar = document.createElement('button');
        btnSumar.textContent = '+';
        btnSumar.onclick = function() {
            cambiarCantidad(pupusa.id, 1);
        };

        celdaCantidad.appendChild(btnRestar);
        celdaCantidad.appendChild(inputCantidad);
        celdaCantidad.appendChild(btnSumar);
    }

    actualizarTotal();
}

function calcularSubtotal(pupusa, cantidad) {
    if (pupusa.precio === 0.35 && cantidad >= 3) {
        const trios = Math.floor(cantidad / 3);
        const restantes = cantidad % 3;
        return (trios * 1.00) + (restantes * 0.35);
    }

    return cantidad * pupusa.precio;
}

function cambiarCantidad(id, cambio) {
    let cantidadActual = pedidoActual[id] || 0;
    let nuevaCantidad = cantidadActual + cambio;

    if (nuevaCantidad < 0) return;

    if (nuevaCantidad === 0) {
        delete pedidoActual[id];
    } else {
        pedidoActual[id] = nuevaCantidad;
    }

    const inputCantidad = document.getElementById('cantidad_' + id);
    if (inputCantidad) {
        inputCantidad.value = nuevaCantidad;
    }

    const pupusa = pupusas.find(p => p.id === id);
    if (pupusa) {
        const filas = document.getElementById('cuerpoPedido').rows;
        for (let i = 0; i < filas.length; i++) {
            const pupusaId = pupusas[i].id;
            if (pupusaId === id) {
                const subtotal = calcularSubtotal(pupusa, nuevaCantidad);
                filas[i].cells[1].textContent = '$' + subtotal.toFixed(2);
                break;
            }
        }
    }

    actualizarTotal();
}

function actualizarTotal() {
    let total = 0;
    let cantidadTotal035 = 0;
    let subtotalOtros = 0;

    for (const [id, cantidad] of Object.entries(pedidoActual)) {
        const pupusa = pupusas.find(p => p.id == id);
        if (pupusa) {
            if (pupusa.precio === 0.35) {
                cantidadTotal035 += cantidad;
            } else {
                subtotalOtros += cantidad * pupusa.precio;
            }
        }
    }

    if (cantidadTotal035 > 0) {
        const trios = Math.floor(cantidadTotal035 / 3);
        const restantes = cantidadTotal035 % 3;
        total = subtotalOtros + (trios * 1.00) + (restantes * 0.35);
    } else {
        total = subtotalOtros;
    }

    document.getElementById('total').textContent = total.toFixed(2);

    const confirmarBtn = document.getElementById('confirmarBtn');
    if (confirmarBtn) {
        confirmarBtn.disabled = total === 0;
    }
}

function reiniciarPedido() {
    if (confirm('Esta seguro de reiniciar el pedido? Se perderan todos los datos.')) {
        pedidoActual = {};
        mostrarTabla();
        limpiarFormularioCliente();
    }
}

function confirmarPedido() {
    try {
        const total = parseFloat(document.getElementById('total').textContent);

        if (total === 0) {
            alert('Debes seleccionar al menos una pupusa antes de confirmar.');
            return;
        }

        const datosCliente = obtenerDatosCliente();
        if (!datosCliente) {
            return;
        }

        const nombreCliente = datosCliente.nombre;
        const telefonoCliente = datosCliente.telefono;

        if (nombreCliente === '') {
            alert('El nombre del cliente es obligatorio.');
            return;
        }

        if (telefonoCliente === '') {
            alert('El numero de telefono es obligatorio.');
            return;
        }

        if (!/^\d{8}$/.test(telefonoCliente)) {
            alert('Por favor, ingrese un numero de telefono valido de 8 digitos.');
            return;
        }

        if (datosCliente.esDelivery) {
            if (datosCliente.direccion === '' || datosCliente.correo === '' || datosCliente.referencia === '') {
                alert('Complete direccion, correo y punto de referencia para delivery.');
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosCliente.correo)) {
                alert('Ingrese un correo valido para delivery.');
                return;
            }
        }

        const items = [];
        for (const [id, cantidad] of Object.entries(pedidoActual)) {
            const pupusa = pupusas.find(p => p.id == id);
            if (pupusa && cantidad > 0) {
                items.push({
                    id: parseInt(id),
                    nombre: pupusa.nombre,
                    precio: pupusa.precio,
                    cantidad: cantidad,
                    subtotal: calcularSubtotal(pupusa, cantidad)
                });
            }
        }

        const nuevoPedido = {
            id: Date.now(),
            fecha: new Date().toLocaleString(),
            cliente: nombreCliente,
            telefono: telefonoCliente,
            esDelivery: datosCliente.esDelivery,
            direccion: datosCliente.direccion,
            correo: datosCliente.correo,
            referencia: datosCliente.referencia,
            items: items,
            totalPupusas: calcularTotalPupusas(),
            total: parseFloat(total),
            estado: 'pendiente'
        };

        const pedidosPendientes = JSON.parse(localStorage.getItem('pedidos_pendientes') || '[]');
        pedidosPendientes.push(nuevoPedido);
        localStorage.setItem('pedidos_pendientes', JSON.stringify(pedidosPendientes));
        registrarCliente(datosCliente, nuevoPedido);

        let resumen = 'PEDIDO GUARDADO EXITOSAMENTE\n\n';
        resumen += `Cliente: ${nombreCliente}\n`;
        resumen += `Telefono: ${telefonoCliente}\n`;
        resumen += `Tipo: ${datosCliente.esDelivery ? 'Delivery' : 'Retiro'}\n`;
        if (datosCliente.esDelivery) {
            resumen += `Direccion: ${datosCliente.direccion}\n`;
            resumen += `Correo: ${datosCliente.correo}\n`;
            resumen += `Referencia: ${datosCliente.referencia}\n`;
        }
        resumen += `Total pupusas: ${nuevoPedido.totalPupusas}\n`;
        resumen += `Total a pagar: $${total.toFixed(2)}\n\n`;
        resumen += 'Detalle del pedido:\n';

        for (const item of items) {
            resumen += `- ${item.nombre}: ${item.cantidad} x $${item.precio} = $${item.subtotal.toFixed(2)}\n`;
        }

        alert(resumen);

        pedidoActual = {};
        mostrarTabla();
        limpiarFormularioCliente();
    } catch (error) {
        console.error('Error confirmando pedido:', error);
        alert('No se pudo guardar el pedido.');
    }
}

function calcularTotalPupusas() {
    let total = 0;
    for (const cantidad of Object.values(pedidoActual)) {
        total += cantidad;
    }
    return total;
}

function obtenerDatosCliente() {
    const nombreInput = document.getElementById('nombreCliente');
    const telefonoInput = document.getElementById('telefonoCliente');
    const esDeliveryInput = document.getElementById('esDelivery');
    const direccionInput = document.getElementById('direccionCliente');
    const correoInput = document.getElementById('correoCliente');
    const referenciaInput = document.getElementById('referenciaCliente');

    if (!nombreInput || !telefonoInput || !esDeliveryInput) {
        alert('No se encontro el formulario del cliente.');
        return null;
    }

    return {
        nombre: nombreInput.value.trim(),
        telefono: telefonoInput.value.trim(),
        esDelivery: esDeliveryInput.checked,
        direccion: direccionInput ? direccionInput.value.trim() : '',
        correo: correoInput ? correoInput.value.trim() : '',
        referencia: referenciaInput ? referenciaInput.value.trim() : ''
    };
}

function registrarCliente(datosCliente, pedido) {
    try {
        const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
        const existente = clientes.find(cliente => cliente.telefono === datosCliente.telefono);

        if (existente) {
            existente.nombre = datosCliente.nombre;
            existente.correo = datosCliente.correo || existente.correo || '';
            existente.direccion = datosCliente.direccion || existente.direccion || '';
            existente.referencia = datosCliente.referencia || existente.referencia || '';
            existente.totalGastado = (Number(existente.totalGastado) || 0) + pedido.total;
            existente.ultimoPedido = pedido.fecha;
        } else {
            clientes.push({
                id: Date.now(),
                nombre: datosCliente.nombre,
                telefono: datosCliente.telefono,
                correo: datosCliente.correo,
                direccion: datosCliente.direccion,
                referencia: datosCliente.referencia,
                totalGastado: pedido.total,
                ultimoPedido: pedido.fecha
            });
        }

        localStorage.setItem('clientes', JSON.stringify(clientes));
    } catch (error) {
        console.error('Error registrando cliente:', error);
    }
}

function limpiarFormularioCliente() {
    const campos = ['nombreCliente', 'telefonoCliente', 'direccionCliente', 'correoCliente', 'referenciaCliente'];

    for (const campo of campos) {
        const input = document.getElementById(campo);
        if (input) {
            input.value = '';
        }
    }

    const esDeliveryInput = document.getElementById('esDelivery');
    if (esDeliveryInput) {
        esDeliveryInput.checked = false;
    }

    mostrarCamposDelivery(false);
}

function mostrarCamposDelivery(mostrar) {
    const camposDelivery = document.getElementById('camposDelivery');
    if (camposDelivery) {
        camposDelivery.hidden = !mostrar;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cargarPupusas();

    const esDeliveryInput = document.getElementById('esDelivery');
    if (esDeliveryInput) {
        esDeliveryInput.addEventListener('change', function() {
            mostrarCamposDelivery(esDeliveryInput.checked);
        });
    }
});
