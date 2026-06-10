   let pedidoOriginal = null;
        let pedidoId = null;
        let pupusas = [];
        let cantidadesEditadas = {};

        // Cargar datos iniciales
        function cargarDatos() {
            // Obtener el ID del pedido a editar
            pedidoId = parseInt(sessionStorage.getItem('pedidoAEditar'));
            
            if (!pedidoId) {
                alert('No se encontrÃ³ el pedido a editar');
                window.location.href = 'index.html';
                return;
            }
            
            // Cargar pupusas disponibles
            const pupusasGuardadas = localStorage.getItem('pupusas');
            if (pupusasGuardadas) {
                pupusas = JSON.parse(pupusasGuardadas);
            } else {
                pupusas = [
                    { id: 1, nombre: 'Queso', precio: 0.35 },
                    { id: 2, nombre: 'Frijol', precio: 0.35 },
                    { id: 3, nombre: 'Revueltas', precio: 0.35 },
                    { id: 4, nombre: 'ChicharrÃ³n', precio: 0.35 },
                    { id: 5, nombre: 'Ayote', precio: 0.35 }
                ];
            }
            
            // Cargar el pedido pendiente
            const pedidosPendientes = JSON.parse(localStorage.getItem('pedidos_pendientes') || '[]');
            pedidoOriginal = pedidosPendientes.find(p => p.id === pedidoId);
            
            if (!pedidoOriginal) {
                alert('No se encontrÃ³ el pedido');
                window.location.href = 'index.html';
                return;
            }
            
            // Mostrar informaciÃ³n del cliente en inputs
            document.getElementById('clienteNombre').value = pedidoOriginal.cliente;
            document.getElementById('clienteTelefono').value = pedidoOriginal.telefono;
            document.getElementById('fechaPedido').textContent = pedidoOriginal.fecha;
            
            // Inicializar cantidades editadas con las actuales
            for (const item of pedidoOriginal.items) {
                cantidadesEditadas[item.id] = item.cantidad;
            }
            
            // Mostrar tabla de ediciÃ³n
            mostrarTablaEdicion();
        }
        
        // Mostrar tabla con todas las pupusas disponibles
        function mostrarTablaEdicion() {
            const tbody = document.getElementById('cuerpoEdicion');
            tbody.innerHTML = '';
            
            let total = 0;
            
            for (let i = 0; i < pupusas.length; i++) {
                const pupusa = pupusas[i];
                const cantidadActual = cantidadesEditadas[pupusa.id] || 0;
                const subtotal = calcularSubtotal(pupusa, cantidadActual);
                total += subtotal;
                
                const fila = tbody.insertRow();
                
                // Nombre y precio
                fila.insertCell(0).textContent = pupusa.nombre;
                fila.insertCell(1).textContent = '$' + pupusa.precio.toFixed(2);
                
                // Celda de cantidad con botones + y -
                const celdaCantidad = fila.insertCell(2);
                const divControles = document.createElement('div');
                divControles.className = 'cantidad-control';
                
                // BotÃ³n restar
                const btnRestar = document.createElement('button');
                btnRestar.textContent = '-';
                btnRestar.onclick = (function(id) {
                    return function() {
                        const input = document.getElementById('input_cantidad_' + id);
                        let valorActual = parseInt(input.value) || 0;
                        if (valorActual > 0) {
                            input.value = valorActual - 1;
                            cambiarCantidad(id, valorActual - 1);
                        }
                    };
                })(pupusa.id);
                
                // Input de cantidad
                const inputCantidad = document.createElement('input');
                inputCantidad.type = 'text';
                inputCantidad.id = 'input_cantidad_' + pupusa.id;
                inputCantidad.value = cantidadActual;
                inputCantidad.onchange = (function(id) {
                    return function(e) {
                        let nuevoValor = parseInt(e.target.value);
                        if (isNaN(nuevoValor) || nuevoValor < 0) {
                            nuevoValor = 0;
                        }
                        e.target.value = nuevoValor;
                        cambiarCantidad(id, nuevoValor);
                    };
                })(pupusa.id);
                
                // BotÃ³n sumar
                const btnSumar = document.createElement('button');
                btnSumar.textContent = '+';
                btnSumar.onclick = (function(id) {
                    return function() {
                        const input = document.getElementById('input_cantidad_' + id);
                        let valorActual = parseInt(input.value) || 0;
                        input.value = valorActual + 1;
                        cambiarCantidad(id, valorActual + 1);
                    };
                })(pupusa.id);
                
                divControles.appendChild(btnRestar);
                divControles.appendChild(inputCantidad);
                divControles.appendChild(btnSumar);
                celdaCantidad.appendChild(divControles);
                
                // Subtotal
                fila.insertCell(3).textContent = '$' + subtotal.toFixed(2);
            }
            
            document.getElementById('totalPedido').textContent = total.toFixed(2);
        }
        
        // Calcular subtotal con promociÃ³n 3x$1.00 para pupusas de $0.35
        function calcularSubtotal(pupusa, cantidad) {
            if (pupusa.precio === 0.35 && cantidad >= 3) {
                const trios = Math.floor(cantidad / 3);
                const restantes = cantidad % 3;
                return (trios * 1.00) + (restantes * 0.35);
            } else {
                return cantidad * pupusa.precio;
            }
        }
        
        // Cambiar cantidad de una pupusa
        function cambiarCantidad(id, nuevaCantidad) {
            if (nuevaCantidad < 0) nuevaCantidad = 0;
            
            if (nuevaCantidad === 0) {
                delete cantidadesEditadas[id];
            } else {
                cantidadesEditadas[id] = nuevaCantidad;
            }
            
            // Actualizar la tabla
            const tbody = document.getElementById('cuerpoEdicion');
            const filas = tbody.rows;
            
            for (let i = 0; i < pupusas.length; i++) {
                if (pupusas[i].id === id) {
                    const nuevaCantidadMostrar = cantidadesEditadas[id] || 0;
                    const nuevoSubtotal = calcularSubtotal(pupusas[i], nuevaCantidadMostrar);
                    // Actualizar subtotal en la Ãºltima columna
                    filas[i].cells[3].textContent = '$' + nuevoSubtotal.toFixed(2);
                    break;
                }
            }
            
            // Actualizar total
            let total = 0;
            for (let i = 0; i < pupusas.length; i++) {
                const pupusa = pupusas[i];
                const cantidad = cantidadesEditadas[pupusa.id] || 0;
                total += calcularSubtotal(pupusa, cantidad);
            }
            document.getElementById('totalPedido').textContent = total.toFixed(2);
        }
        
        // Validar telÃ©fono (8 dÃ­gitos)
        function validarTelefono(telefono) {
            return /^\d{8}$/.test(telefono);
        }
        
        // Guardar cambios del pedido
        function guardarCambios() {
            // Obtener nuevos datos del cliente
            const nuevoNombre = document.getElementById('clienteNombre').value.trim();
            const nuevoTelefono = document.getElementById('clienteTelefono').value.trim();
            
            // Validar nombre
            if (nuevoNombre === '') {
                alert('âš ï¸ Por favor, ingrese el nombre del cliente');
                document.getElementById('clienteNombre').focus();
                return;
            }
            
            // Validar telÃ©fono
            if (nuevoTelefono === '') {
                alert('âš ï¸ Por favor, ingrese el nÃºmero de telÃ©fono');
                document.getElementById('clienteTelefono').focus();
                return;
            }
            
            if (!validarTelefono(nuevoTelefono)) {
                alert('âš ï¸ Por favor, ingrese un nÃºmero de telÃ©fono vÃ¡lido de 8 dÃ­gitos');
                document.getElementById('clienteTelefono').focus();
                return;
            }
            
            // Verificar que haya al menos un producto
            let tieneProductos = false;
            for (const cantidad of Object.values(cantidadesEditadas)) {
                if (cantidad > 0) {
                    tieneProductos = true;
                    break;
                }
            }
            
            if (!tieneProductos) {
                alert('âš ï¸ El pedido debe tener al menos una pupusa');
                return;
            }
            
            // Construir los nuevos items del pedido
            const nuevosItems = [];
            let totalPupusas = 0;
            let totalPedido = 0;
            
            for (const [id, cantidad] of Object.entries(cantidadesEditadas)) {
                if (cantidad > 0) {
                    const pupusa = pupusas.find(p => p.id == id);
                    if (pupusa) {
                        const subtotal = calcularSubtotal(pupusa, cantidad);
                        nuevosItems.push({
                            id: pupusa.id,
                            nombre: pupusa.nombre,
                            precio: pupusa.precio,
                            cantidad: cantidad,
                            subtotal: subtotal
                        });
                        totalPupusas += cantidad;
                        totalPedido += subtotal;
                    }
                }
            }
            
            // Actualizar el pedido
            const pedidoActualizado = {
                ...pedidoOriginal,
                cliente: nuevoNombre,
                telefono: nuevoTelefono,
                items: nuevosItems,
                totalPupusas: totalPupusas,
                total: totalPedido,
                editado: true,
                fechaEdicion: new Date().toLocaleString()
            };
            
            // Guardar en localStorage
            let pedidosPendientes = JSON.parse(localStorage.getItem('pedidos_pendientes') || '[]');
            const index = pedidosPendientes.findIndex(p => p.id === pedidoId);
            
            if (index !== -1) {
                pedidosPendientes[index] = pedidoActualizado;
                localStorage.setItem('pedidos_pendientes', JSON.stringify(pedidosPendientes));
                
                // Mostrar resumen de cambios
                let resumen = 'âœ… PEDIDO EDITADO EXITOSAMENTE âœ…\n\n';
                resumen += `Pedido #${pedidoId}\n`;
                resumen += `Cliente: ${pedidoOriginal.cliente} â†’ ${nuevoNombre}\n`;
                resumen += `TelÃ©fono: ${pedidoOriginal.telefono} â†’ ${nuevoTelefono}\n`;
                resumen += `Total anterior: $${pedidoOriginal.total.toFixed(2)}\n`;
                resumen += `Nuevo total: $${totalPedido.toFixed(2)}\n`;
                resumen += `Total pupusas: ${totalPupusas}\n\n`;
                resumen += `ðŸ›’ Productos:\n`;
                
                for (const item of nuevosItems) {
                    resumen += `- ${item.nombre}: ${item.cantidad} x $${item.precio} = $${item.subtotal.toFixed(2)}\n`;
                }
                
                alert(resumen);
                
                // Limpiar sessionStorage y redirigir
                sessionStorage.removeItem('pedidoAEditar');
                window.location.href = 'index.html';
            }
        }
        
        // Cancelar ediciÃ³n
        function cancelarEdicion() {
            if (confirm('Â¿Cancelar ediciÃ³n? Los cambios no se guardarÃ¡n.')) {
                sessionStorage.removeItem('pedidoAEditar');
                window.location.href = 'index.html';
            }
        }
        
        // Inicializar
        document.addEventListener('DOMContentLoaded', function() {
            cargarDatos();
        });
