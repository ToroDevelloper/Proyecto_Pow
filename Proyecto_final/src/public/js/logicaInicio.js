function solicitarConfirmacionParaEliminar(evento, formulario) {
    evento.preventDefault(); // Previene el envío inmediato del formulario.
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e74c3c',
        cancelButtonColor: '#3498db',
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    }).then((resultado) => {
        // Si el usuario confirma, se envía el formulario.
        if (resultado.isConfirmed) {
            formulario.submit();
        }
    });
}

// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', function() {
    
    // --- SECCIÓN DE BÚSQUEDA EN TIEMPO REAL ---
    const campoBusqueda = document.getElementById('searchBooks');
    const contenedorTarjetasLibros = document.querySelector('.row.g-4');
    const todasLasTarjetasLibros = contenedorTarjetasLibros ? Array.from(contenedorTarjetasLibros.children) : [];
    const contadorInsignia = document.querySelector('.badge-count');
    const mensajeSinResultados = document.querySelector('.empty-state-container-small');

 
    function filtrarLibrosPorTermino() {
        const terminoBusqueda = campoBusqueda.value.toLowerCase();
        let contadorLibrosVisibles = 0;

        todasLasTarjetasLibros.forEach(tarjeta => {
            const titulo = tarjeta.querySelector('.card-title').textContent.toLowerCase();
            const autor = tarjeta.querySelector('.card-subtitle').textContent.toLowerCase();
            const genero = tarjeta.querySelector('.badge-genre').textContent.toLowerCase();
            
            const coincideConBusqueda = titulo.includes(terminoBusqueda) || autor.includes(terminoBusqueda) || genero.includes(terminoBusqueda);

            if (coincideConBusqueda) {
                tarjeta.style.display = 'block';
                contadorLibrosVisibles++;
            } else {
                tarjeta.style.display = 'none';
            }
        });

        if (contadorInsignia) {
            contadorInsignia.textContent = contadorLibrosVisibles;
        }

        if (mensajeSinResultados) {
            const mostrarMensaje = contadorLibrosVisibles === 0 && todasLasTarjetasLibros.length > 0;
            mensajeSinResultados.style.display = mostrarMensaje ? 'flex' : 'none';
            if (contenedorTarjetasLibros) {
                contenedorTarjetasLibros.style.display = mostrarMensaje ? 'none' : 'flex';
            }
        }
    }

    // Añade el evento 'input' al campo de búsqueda para filtrar mientras el usuario escribe.
    if (campoBusqueda) {
        campoBusqueda.addEventListener('input', () => {
            const urlActual = new URL(window.location);
            const parametrosUrl = urlActual.searchParams;

            if (parametrosUrl.has('categoria') || parametrosUrl.has('estado')) {
                const nuevaUrl = new URL(window.location.origin);
                nuevaUrl.searchParams.set('q', campoBusqueda.value);
                window.location.href = nuevaUrl.toString();
            } else {
                filtrarLibrosPorTermino();
            }
        });
    }

    // Comprueba si la página se cargó con un término de búsqueda en la URL.
    const parametrosUrlIniciales = new URLSearchParams(window.location.search);
    const consultaBusquedaInicial = parametrosUrlIniciales.get('q');
    if (consultaBusquedaInicial && campoBusqueda) {
        campoBusqueda.value = consultaBusquedaInicial;
        campoBusqueda.focus();
        filtrarLibrosPorTermino();
        window.history.replaceState({}, document.title, "/");
    }

    // --- SECCIÓN DEL MODAL DE DETALLES DEL LIBRO ---
    const modalDetallesLibro = document.getElementById('bookDetailsModal');
    if (modalDetallesLibro) {
        modalDetallesLibro.addEventListener('show.bs.modal', function (evento) {
            const elementoActivador = evento.relatedTarget;
            const detallesLibro = JSON.parse(elementoActivador.getAttribute('data-book-details'));

            const tituloModal = modalDetallesLibro.querySelector('.modal-title');
            const portadaModal = modalDetallesLibro.querySelector('#modalBookCover');
            const autorModal = modalDetallesLibro.querySelector('#modalBookAuthor');
            const descripcionModal = modalDetallesLibro.querySelector('#modalBookDescription');
            const estadoModal = modalDetallesLibro.querySelector('#modalBookState');
            const generoModal = modalDetallesLibro.querySelector('#modalBookGenre');
            const creacionAutorModal = modalDetallesLibro.querySelector('#modalAuthorCreation');
            const adicionLibroModal = modalDetallesLibro.querySelector('#modalBookAdded');
            const botonEditarModal = modalDetallesLibro.querySelector('#modalEditButton');
            const formularioEliminarModal = modalDetallesLibro.querySelector('#modalDeleteForm');

            tituloModal.textContent = detallesLibro.titulo;
            portadaModal.src = detallesLibro.urlPortada;
            autorModal.textContent = detallesLibro.Autor ? detallesLibro.Autor.nombre : 'Desconocido';
            
            const textoDescripcion = detallesLibro.descripcion || 'No hay descripción disponible.';
            descripcionModal.innerHTML = textoDescripcion.replace(/\n/g, '<br>');

            estadoModal.textContent = detallesLibro.estado;
            estadoModal.className = `badge badge-estado badge-${detallesLibro.estado.toLowerCase()} w-auto`;
            generoModal.textContent = detallesLibro.Genero ? detallesLibro.Genero.nombre : 'Sin género';

            creacionAutorModal.textContent = detallesLibro.Autor && detallesLibro.Autor.fechaCreacion ? new Date(detallesLibro.Autor.fechaCreacion).toLocaleDateString() : 'No especificada';
            adicionLibroModal.textContent = detallesLibro.detalle ? new Date(detallesLibro.detalle).toLocaleDateString() : 'No especificada';

            botonEditarModal.href = `/editar/${detallesLibro.id}`;
            formularioEliminarModal.action = `/eliminar/${detallesLibro.id}?_method=DELETE`;
        });
    }

    // --- SECCIÓN DE CONFIRMACIÓN DE ELIMINACIÓN ---
    const formulariosDeEliminacion = document.querySelectorAll('.delete-form');

    // Añade un event listener a cada formulario.
    formulariosDeEliminacion.forEach(formulario => {
        formulario.addEventListener('submit', function(evento) {
            solicitarConfirmacionParaEliminar(evento, this);
        });
    });

    // --- SECCIÓN DE ALERTAS DE NOTIFICACIÓN ---
    const parametrosUrl = new URLSearchParams(window.location.search);
    const tipoAlerta = parametrosUrl.get('alerta');

    if (tipoAlerta) {
        let titulo, texto, icono;
        
        switch(tipoAlerta) {
            case 'creado':
                titulo = '¡Creado!';
                texto = 'El libro ha sido agregado correctamente.';
                icono = 'success';
                break;
            case 'actualizado':
                titulo = '¡Actualizado!';
                texto = 'El libro ha sido actualizado correctamente.';
                icono = 'success';
                break;
            case 'eliminado':
                titulo = '¡Eliminado!';
                texto = 'El libro ha sido eliminado correctamente.';
                icono = 'success';
                break;
        }

        if (titulo) {
            Swal.fire({
                title: titulo,
                text: texto,
                icon: icono,
                timer: 3000,
                showConfirmButton: false
            });
            window.history.replaceState({}, document.title, "/");
        }
    }
});