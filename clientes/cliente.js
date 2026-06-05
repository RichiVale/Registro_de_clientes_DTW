let clientes = [];

function leerJsonLocalStorage(clave, valorPorDefecto) {
    try {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : valorPorDefecto;
    } catch (error) {
        console.error('Error leyendo ' + clave + ':', error);
        return valorPorDefecto;
    }
}

function ajaxLeerPedidos() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                const pendientes = leerJsonLocalStorage('pedidos_pendientes', []);
                const entregados = leerJsonLocalStorage('pedidos_entregados', []);

                resolve({
                    pendientes: pendientes.map(pedido => ({ ...pedido, estadoVista: 'Pendiente' })),
                    entregados: entregados.map(pedido => ({ ...pedido, estadoVista: 'Entregado' }))
                });
            } catch (error) {
                reject(error);
            }
        }, 100);
    });
}

function ajaxObtenerPedidosCliente(telefono) {
    return ajaxLeerPedidos().then(datos => {
        return datos.pendientes
            .concat(datos.entregados)
            .filter(pedido => pedido.telefono === telefono);
    });
}

function guardarClientes() {
    try {
        localStorage.setItem('clientes', JSON.stringify(clientes));
        return true;
    } catch (error) {
        console.error('Error guardando clientes:', error);
        alert('No se pudieron guardar los clientes.');
        return false;
    }
}

function cargarClientes() {
    sincronizarClientesDesdePedidos(false);
    mostrarClientes();
}

function mostrarClientes() {
    const tbody = document.getElementById('cuerpoClientes');
    tbody.innerHTML = '';

    document.getElementById('totalClientes').textContent = clientes.length;

    const clientesPorGasto = [...clientes].sort((a, b) => {
        return (Number(b.totalGastado) || 0) - (Number(a.totalGastado) || 0);
    });

    document.getElementById('clienteMasGasto').textContent = clientesPorGasto.length
        ? `${clientesPorGasto[0].nombre} ($${(Number(clientesPorGasto[0].totalGastado) || 0).toFixed(2)})`
        : 'Ninguno';

    if (clientesPorGasto.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No hay clientes registrados</td></tr>';
        return;
    }

    for (const cliente of clientesPorGasto) {
        const fila = tbody.insertRow();
        fila.insertCell(0).textContent = cliente.nombre;
        fila.insertCell(1).textContent = cliente.telefono;
        fila.insertCell(2).textContent = cliente.correo || 'N/A';
        fila.insertCell(3).textContent = cliente.direccion || 'N/A';
        fila.insertCell(4).textContent = '$' + (Number(cliente.totalGastado) || 0).toFixed(2);
        fila.insertCell(5).textContent = cliente.ultimoPedido || 'N/A';

        const celdaAcciones = fila.insertCell(6);

        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = function() {
            editarCliente(cliente.telefono);
        };

        const btnVerPedidos = document.createElement('button');
        btnVerPedidos.textContent = 'Ver pedidos';
        btnVerPedidos.onclick = function() {
            verPedidosCliente(cliente.telefono, cliente.nombre);
        };

        celdaAcciones.appendChild(btnEditar);
        celdaAcciones.appendChild(btnVerPedidos);
    }
}

function editarCliente(telefono) {
    const cliente = clientes.find(c => c.telefono === telefono);
    if (!cliente) return;

    document.getElementById('telefonoOriginal').value = cliente.telefono || '';
    document.getElementById('nombreCliente').value = cliente.nombre || '';
    document.getElementById('telefonoCliente').value = cliente.telefono || '';
    document.getElementById('correoCliente').value = cliente.correo || '';
    document.getElementById('direccionCliente').value = cliente.direccion || '';
    document.getElementById('referenciaCliente').value = cliente.referencia || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function guardarEdicionCliente() {
    try {
        const telefonoOriginal = document.getElementById('telefonoOriginal').value;
        const nombre = document.getElementById('nombreCliente').value.trim();
        const telefono = document.getElementById('telefonoCliente').value.trim();
        const correo = document.getElementById('correoCliente').value.trim();
        const direccion = document.getElementById('direccionCliente').value.trim();
        const referencia = document.getElementById('referenciaCliente').value.trim();

        if (telefonoOriginal === '') {
            alert('Seleccione un cliente para editar.');
            return;
        }

        if (nombre === '') {
            alert('Ingrese el nombre del cliente.');
            return;
        }

        if (!/^\d{8}$/.test(telefono)) {
            alert('Ingrese un celular valido de 8 digitos.');
            return;
        }

        if (correo !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            alert('Ingrese un correo valido.');
            return;
        }

        actualizarClienteEnPedidos('pedidos_pendientes', telefonoOriginal, {
            nombre,
            telefono,
            correo,
            direccion,
            referencia
        });

        actualizarClienteEnPedidos('pedidos_entregados', telefonoOriginal, {
            nombre,
            telefono,
            correo,
            direccion,
            referencia
        });

        sincronizarClientesDesdePedidos(false);
        limpiarFormularioCliente();
        alert('Cliente actualizado correctamente.');
    } catch (error) {
        console.error('Error editando cliente:', error);
        alert('No se pudo actualizar el cliente.');
    }
}

function actualizarClienteEnPedidos(clave, telefonoOriginal, datosCliente) {
    const pedidos = leerJsonLocalStorage(clave, []);

    for (const pedido of pedidos) {
        if (pedido.telefono === telefonoOriginal) {
            pedido.cliente = datosCliente.nombre;
            pedido.telefono = datosCliente.telefono;
            pedido.correo = datosCliente.correo;
            pedido.direccion = datosCliente.direccion;
            pedido.referencia = datosCliente.referencia;
        }
    }

    localStorage.setItem(clave, JSON.stringify(pedidos));
}

function limpiarFormularioCliente() {
    document.getElementById('telefonoOriginal').value = '';
    document.getElementById('nombreCliente').value = '';
    document.getElementById('telefonoCliente').value = '';
    document.getElementById('correoCliente').value = '';
    document.getElementById('direccionCliente').value = '';
    document.getElementById('referenciaCliente').value = '';
}

function verPedidosCliente(telefono, nombre) {
    const contenedor = document.getElementById('pedidosCliente');
    contenedor.innerHTML = '<p>Cargando pedidos...</p>';

    ajaxObtenerPedidosCliente(telefono)
        .then(pedidos => {
            if (pedidos.length === 0) {
                contenedor.innerHTML = `<p>${nombre} no tiene pedidos registrados.</p>`;
                return;
            }

            contenedor.innerHTML = '';
            const titulo = document.createElement('h3');
            titulo.textContent = 'Pedidos de ' + nombre;
            contenedor.appendChild(titulo);

            for (const pedido of pedidos) {
                contenedor.appendChild(crearTicketCliente(pedido));
            }
        })
        .catch(error => {
            console.error('Error AJAX al cargar pedidos del cliente:', error);
            contenedor.innerHTML = '<p>No se pudieron cargar los pedidos del cliente.</p>';
        });
}

function crearTicketCliente(pedido) {
    const ticketDiv = document.createElement('div');
    ticketDiv.className = 'ticket';
    ticketDiv.id = 'ticket_cliente_' + pedido.id;

    let totalPupusas = 0;
    for (const item of pedido.items || []) {
        totalPupusas += Number(item.cantidad) || 0;
    }

    ticketDiv.innerHTML = `
        <div class="ticket-header">
            <h3>PEDIDO #${pedido.id}</h3>
            <p>Estado: ${pedido.estadoVista}</p>
            <p>Fecha: ${pedido.fecha}</p>
            ${pedido.fechaEntregado ? `<p>Entregado: ${pedido.fechaEntregado}</p>` : ''}
            <p>Cliente: ${pedido.cliente}</p>
            <p>Tel: ${pedido.telefono}</p>
            ${pedido.esDelivery ? `
                <p>Delivery: Si</p>
                <p>Direccion: ${pedido.direccion || 'N/A'}</p>
                <p>Correo: ${pedido.correo || 'N/A'}</p>
                <p>Referencia: ${pedido.referencia || 'N/A'}</p>
            ` : '<p>Delivery: No</p>'}
        </div>

        <div class="ticket-body">
            <div class="ticket-item" style="font-weight: bold; border-bottom: 1px solid #ccc; margin-bottom: 5px;">
                <span class="ticket-item-name">Producto</span>
                <span class="ticket-item-qty">Cant</span>
                <span class="ticket-item-price">Subtotal</span>
            </div>
    `;

    for (const item of pedido.items || []) {
        ticketDiv.innerHTML += `
            <div class="ticket-item">
                <span class="ticket-item-name">${item.nombre}</span>
                <span class="ticket-item-qty">${item.cantidad}</span>
                <span class="ticket-item-price">$${Number(item.subtotal).toFixed(2)}</span>
            </div>
        `;
    }

    ticketDiv.innerHTML += `
        </div>

        <div class="ticket-divider"></div>

        <div class="ticket-total">
            <span>TOTAL:</span>
            <span>$${Number(pedido.total).toFixed(2)}</span>
        </div>

        <div class="ticket-footer">
            <small>Total de pupusas: ${totalPupusas}</small>
        </div>
    `;

    return ticketDiv;
}

function sincronizarClientesDesdePedidos(mostrarMensaje = true) {
    const pedidosPendientes = leerJsonLocalStorage('pedidos_pendientes', []);
    const pedidosEntregados = leerJsonLocalStorage('pedidos_entregados', []);
    const pedidos = pedidosPendientes.concat(pedidosEntregados);
    const mapaClientes = {};

    for (const pedido of pedidos) {
        if (!pedido.telefono) continue;

        if (!mapaClientes[pedido.telefono]) {
            mapaClientes[pedido.telefono] = {
                id: Date.now() + Object.keys(mapaClientes).length,
                nombre: pedido.cliente || 'Sin nombre',
                telefono: pedido.telefono,
                correo: pedido.correo || '',
                direccion: pedido.direccion || '',
                referencia: pedido.referencia || '',
                totalGastado: 0,
                ultimoPedido: ''
            };
        }

        mapaClientes[pedido.telefono].nombre = pedido.cliente || mapaClientes[pedido.telefono].nombre;
        mapaClientes[pedido.telefono].correo = pedido.correo || mapaClientes[pedido.telefono].correo;
        mapaClientes[pedido.telefono].direccion = pedido.direccion || mapaClientes[pedido.telefono].direccion;
        mapaClientes[pedido.telefono].referencia = pedido.referencia || mapaClientes[pedido.telefono].referencia;
        mapaClientes[pedido.telefono].totalGastado += Number(pedido.total) || 0;
        mapaClientes[pedido.telefono].ultimoPedido = pedido.fecha || mapaClientes[pedido.telefono].ultimoPedido;
    }

    clientes = Object.values(mapaClientes);
    guardarClientes();
    mostrarClientes();

    if (mostrarMensaje) {
        alert('Clientes sincronizados desde pedidos.');
    }
}

document.addEventListener('DOMContentLoaded', cargarClientes);
