       // Cargar y mostrar pedidos pendientes en formato ticket
        function cargarPedidosPendientes() {
            const pedidos = JSON.parse(localStorage.getItem('pedidos_pendientes') || '[]');
            const container = document.getElementById('listaPendientes');
            const totalPedidosSpan = document.getElementById('totalPedidos');
            
            totalPedidosSpan.textContent = pedidos.length;
            
            if (pedidos.length === 0) {
                container.innerHTML = '<p class="no-pedidos">No hay pedidos pendientes</p>';
                return;
            }
            
            container.innerHTML = '';
            
            for (let i = 0; i < pedidos.length; i++) {
                const pedido = pedidos[i];
                const ticket = crearTicket(pedido);
                container.appendChild(ticket);
            }
        }
        
        // Crear un ticket HTML para un pedido
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
                    <p>Fecha: ${pedido.fecha}</p>
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
                    <span>TOTAL:</span>
                    <span>$${pedido.total.toFixed(2)}</span>
                </div>
                
                <div class="ticket-footer">
                    <small>Total de pupusas: ${totalPupusas}</small>
                </div>
                
                <div class="ticket-actions">
                    <button class="btn-entregar" onclick="marcarEntregado(${pedido.id})">MARCAR ENTREGADO</button>
                    <button class="btn-eliminar" onclick="eliminarPedido(${pedido.id})">ELIMINAR</button>
                    <button class="btn-editar" onclick="editarPedido(${pedido.id})">EDITAR</button>
                </div>
            `;
            
            return ticketDiv;
        }
        
        // Marcar pedido como entregado
        function marcarEntregado(id) {
            if (confirm('Marcar este pedido como entregado?')) {
                let pendientes = JSON.parse(localStorage.getItem('pedidos_pendientes') || '[]');
                let entregados = JSON.parse(localStorage.getItem('pedidos_entregados') || '[]');
                
                const pedidoIndex = pendientes.findIndex(p => p.id === id);
                if (pedidoIndex !== -1) {
                    const pedido = pendientes[pedidoIndex];
                    pedido.estado = 'entregado';
                    pedido.fechaEntregado = new Date().toLocaleString();
                    
                    entregados.push(pedido);
                    pendientes.splice(pedidoIndex, 1);
                    
                    localStorage.setItem('pedidos_pendientes', JSON.stringify(pendientes));
                    localStorage.setItem('pedidos_entregados', JSON.stringify(entregados));
                    
                    alert('Pedido marcado como entregado');
                    cargarPedidosPendientes();
                }
            }
        }
        
        // Eliminar pedido
        function eliminarPedido(id) {
            if (confirm('¿Estás seguro de eliminar este pedido? Se moverá a pedidos borrados.')) {
                let pendientes = JSON.parse(localStorage.getItem('pedidos_pendientes') || '[]');
                let borrados = JSON.parse(localStorage.getItem('pedidos_borrados') || '[]');
                const pedidoIndex = pendientes.findIndex(p => p.id === id);

                if (pedidoIndex !== -1) {
                    const pedido = pendientes[pedidoIndex];
                    pedido.estadoAnterior = pedido.estado || 'pendiente';
                    pedido.estado = 'borrado';
                    pedido.fechaBorrado = new Date().toLocaleString();

                    borrados.push(pedido);
                    pendientes.splice(pedidoIndex, 1);

                    localStorage.setItem('pedidos_pendientes', JSON.stringify(pendientes));
                    localStorage.setItem('pedidos_borrados', JSON.stringify(borrados));

                    alert('Pedido movido a pedidos borrados');
                    cargarPedidosPendientes();
                }
            }
        }


        // Editar pedido - redirigir a pagina de edicion
        function editarPedido(id) {
            // Guardar el ID del pedido a editar en sessionStorage
            sessionStorage.setItem('pedidoAEditar', id);
            // Redirigir a la pagina de edicion
            window.location.href = 'editar_pedido.html';
        }
        


        
        // Inicializar
        document.addEventListener('DOMContentLoaded', function() {
            cargarPedidosPendientes();
        });

