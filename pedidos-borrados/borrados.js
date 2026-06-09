function cargarPedidosBorrados() {
    const pedidos = JSON.parse(localStorage.getItem('pedidos_borrados') || '[]');
    const container = document.getElementById('listaBorrados');
    const totalPedidosSpan = document.getElementById('totalPedidos');
    const totalBorradoSpan = document.getElementById('totalBorrado');

    let totalBorrado = 0;
    for (const pedido of pedidos) {
        totalBorrado += Number(pedido.total) || 0;
    }

    totalPedidosSpan.textContent = pedidos.length;
    totalBorradoSpan.textContent = totalBorrado.toFixed(2);

    if (pedidos.length === 0) {
        container.innerHTML = '<p class="no-pedidos">No hay pedidos borrados</p>';
        return;
    }

    container.innerHTML = '';

    for (const pedido of pedidos) {
        container.appendChild(crearTicket(pedido));
    }
}

function crearTicket(pedido) {
    const ticketDiv = document.createElement('div');
    ticketDiv.className = 'ticket';
    ticketDiv.id = 'ticket_borrado_' + pedido.id;

    let totalPupusas = 0;
    for (const item of pedido.items || []) {
        totalPupusas += Number(item.cantidad) || 0;
    }

    ticketDiv.innerHTML = `
        <div class="ticket-header">
            <h3>PEDIDO #${pedido.id}</h3>
            <p>Pedido: ${pedido.fecha}</p>
            <p>Borrado: ${pedido.fechaBorrado || 'N/A'}</p>
            <p>Estado anterior: ${pedido.estadoAnterior || pedido.estado || 'N/A'}</p>
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
            <div>Total de pupusas: ${totalPupusas}</div>
            <div class="borrado">BORRADO</div>
        </div>
    `;

    return ticketDiv;
}

document.addEventListener('DOMContentLoaded', cargarPedidosBorrados);
