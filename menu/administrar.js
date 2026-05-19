// Variable global para almacenar pupusas
let pupusas = [];

function obtenerPupusasIniciales() {
    return [
        { id: 1, nombre: 'Queso', precio: 0.35 },
        { id: 2, nombre: 'Frijol', precio: 0.35 },
        { id: 3, nombre: 'Revueltas', precio: 0.35 },
        { id: 4, nombre: 'Chicharron', precio: 0.35 },
        { id: 5, nombre: 'Ayote', precio: 0.35 }
    ];
}

function inicializarDatos() {
    try {
        const pupusasGuardadas = localStorage.getItem('pupusas');

        if (!pupusasGuardadas) {
            pupusas = obtenerPupusasIniciales();
            guardarEnLocalStorage();
        } else {
            pupusas = JSON.parse(pupusasGuardadas);
        }
    } catch (error) {
        console.error('Error al cargar pupusas:', error);
        alert('No se pudieron cargar las pupusas. Se usaran datos iniciales.');
        pupusas = obtenerPupusasIniciales();
    }
}

function guardarEnLocalStorage() {
    try {
        localStorage.setItem('pupusas', JSON.stringify(pupusas));
        return true;
    } catch (error) {
        console.error('Error al guardar pupusas:', error);
        alert('No se pudieron guardar los datos.');
        return false;
    }
}

function mostrarPupusas() {
    const cuerpoTabla = document.getElementById('cuerpoTabla');
    cuerpoTabla.innerHTML = '';

    if (pupusas.length === 0) {
        cuerpoTabla.innerHTML = '<tr><td colspan="4">No hay pupusas registradas</td></tr>';
        return;
    }

    for (let i = 0; i < pupusas.length; i++) {
        const pupusa = pupusas[i];
        const fila = cuerpoTabla.insertRow();
        fila.insertCell(0).textContent = pupusa.id;
        fila.insertCell(1).textContent = pupusa.nombre;
        fila.insertCell(2).textContent = '$' + pupusa.precio.toFixed(2);

        const celdaAcciones = fila.insertCell(3);
        const btnEditar = document.createElement('button');
        btnEditar.textContent = 'Editar';
        btnEditar.onclick = function() {
            editarPupusa(pupusa.id);
        };

        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.onclick = function() {
            eliminarPupusa(pupusa.id);
        };

        celdaAcciones.appendChild(btnEditar);
        celdaAcciones.appendChild(btnEliminar);
    }
}

function guardarPupusa() {
    try {
        const id = document.getElementById('editId').value;
        const nombre = document.getElementById('nombrePupusa').value.trim();
        const precio = parseFloat(document.getElementById('precioPupusa').value);

        if (nombre === '') {
            alert('Por favor, ingrese el nombre de la pupusa');
            return;
        }

        if (isNaN(precio) || precio <= 0) {
            alert('Por favor, ingrese un precio valido');
            return;
        }

        if (id) {
            for (let i = 0; i < pupusas.length; i++) {
                if (pupusas[i].id == id) {
                    pupusas[i].nombre = nombre;
                    pupusas[i].precio = precio;
                    break;
                }
            }
            alert('Pupusa editada correctamente');
        } else {
            let nuevoId = 1;
            for (let i = 0; i < pupusas.length; i++) {
                if (pupusas[i].id >= nuevoId) {
                    nuevoId = pupusas[i].id + 1;
                }
            }
            pupusas.push({ id: nuevoId, nombre: nombre, precio: precio });
            alert('Pupusa agregada correctamente');
        }

        if (guardarEnLocalStorage()) {
            mostrarPupusas();
            limpiarFormulario();
        }
    } catch (error) {
        console.error('Error en guardarPupusa:', error);
        alert('Ocurrio un error al guardar la pupusa.');
    }
}

function editarPupusa(id) {
    try {
        for (let i = 0; i < pupusas.length; i++) {
            if (pupusas[i].id === id) {
                document.getElementById('editId').value = pupusas[i].id;
                document.getElementById('nombrePupusa').value = pupusas[i].nombre;
                document.getElementById('precioPupusa').value = pupusas[i].precio;
                break;
            }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error en editarPupusa:', error);
        alert('No se pudo cargar la pupusa para editar.');
    }
}

function eliminarPupusa(id) {
    try {
        if (confirm('Esta seguro de eliminar esta pupusa?')) {
            const nuevaLista = [];
            for (let i = 0; i < pupusas.length; i++) {
                if (pupusas[i].id !== id) {
                    nuevaLista.push(pupusas[i]);
                }
            }

            pupusas = nuevaLista;

            if (guardarEnLocalStorage()) {
                mostrarPupusas();
                alert('Pupusa eliminada correctamente');
            }
        }
    } catch (error) {
        console.error('Error en eliminarPupusa:', error);
        alert('No se pudo eliminar la pupusa.');
    }
}

function limpiarFormulario() {
    document.getElementById('editId').value = '';
    document.getElementById('nombrePupusa').value = '';
    document.getElementById('precioPupusa').value = '0.35';
}

document.addEventListener('DOMContentLoaded', function() {
    inicializarDatos();
    mostrarPupusas();
});
