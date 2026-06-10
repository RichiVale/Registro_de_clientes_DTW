  // Cargar y mostrar pedidos entregados en formato ticket
        function cargarPedidosEntregados() {
            const pedidos = JSON.parse(localStorage.getItem('pedidos_entregados') || '[]');
            const container = document.getElementById('listaEntregados');
            const totalPedidosSpan = document.getElementById('totalPedidos');
            const totalRecaudadoSpan = document.getElementById('totalRecaudado');
            
            // Calcular total recaudado
            let totalRecaudado = 0;
            for (const pedido of pedidos) {
                totalRecaudado += pedido.total;
            }
            
            totalPedidosSpan.textContent = pedidos.length;
            totalRecaudadoSpan.textContent = totalRecaudado.toFixed(2);
            
            if (pedidos.length === 0) {
                container.innerHTML = '<p class="no-pedidos">ðŸ“­ No hay pedidos entregados</p>';
                return;
            }
            
            container.innerHTML = '';
            
            for (let i = 0; i < pedidos.length; i++) {
                const pedido = pedidos[i];
                const ticket = crearTicket(pedido);
                container.appendChild(ticket);
            }
        }
        
        // Crear un ticket HTML para un pedido entregado
        function crearTicket(pedido) {
            const ticketDiv = document.createElement('div');
            ticketDiv.className = 'ticket';
            ticketDiv.id = 'ticket_' + pedido.id;
            
            // Calcular total de pupusas (suma de cantidades)
            let totalPupusas = 0;
            for (const item of pedido.items) {
                totalPupusas += item.cantidad;
            }
            
            // Header del ticket
            ticketDiv.innerHTML = `
                <div class="ticket-header">
                    <h3>PEDIDO #${pedido.id}</h3>
                    <p>Pedido: ${pedido.fecha}</p>
                    <p>Entregado: ${pedido.fechaEntregado || 'N/A'}</p>
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
            
            // Items del pedido
            for (const item of pedido.items) {
                ticketDiv.innerHTML += `
                    <div class="ticket-item">
                        <span class="ticket-item-name">${item.nombre}</span>
                        <span class="ticket-item-qty">${item.cantidad}</span>
                        <span class="ticket-item-price">$${item.subtotal.toFixed(2)}</span>
                    </div>
                `;
            }
            
            // Total del ticket
            ticketDiv.innerHTML += `
                </div>
                
                <div class="ticket-divider"></div>
                
                <div class="ticket-total">
                    <span>TOTAL PAGADO:</span>
                    <span>$${pedido.total.toFixed(2)}</span>
                </div>
                
                <div class="ticket-footer">
                    <div>Total de pupusas: ${totalPupusas}</div>
                    <div class="entregado">ENTREGADO</div>
                </div>

                <div class="ticket-actions">
                    <button class="btn-restaurar" onclick="restaurarPedido(${pedido.id})">Restaurar pedido</button>
                </div>
            `;
            
            return ticketDiv;
        }

        // Restaurar pedido entregado a la lista de pendientes
        function restaurarPedido(id) {
            if (confirm('Â¿Restaurar este pedido a pendientes?')) {
                let entregados = JSON.parse(localStorage.getItem('pedidos_entregados') || '[]');
                let pendientes = JSON.parse(localStorage.getItem('pedidos_pendientes') || '[]');

                const pedidoIndex = entregados.findIndex(p => p.id === id);

                if (pedidoIndex !== -1) {
                    const pedido = entregados[pedidoIndex];
                    pedido.estado = 'pendiente';
                    delete pedido.fechaEntregado;

                    pendientes.push(pedido);
                    entregados.splice(pedidoIndex, 1);

                    localStorage.setItem('pedidos_pendientes', JSON.stringify(pendientes));
                    localStorage.setItem('pedidos_entregados', JSON.stringify(entregados));

                    alert('Pedido restaurado a pendientes');
                    cargarPedidosEntregados();
                }
            }
        }
        
        // Inicializar
        document.addEventListener('DOMContentLoaded', function() {
            cargarPedidosEntregados();
        });

