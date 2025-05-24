// test comentario Omar Brondo

let loggedUserId = null;
let editingInscripcionId = null;

document.addEventListener("DOMContentLoaded", () => {
  // Al cargar el DOM, pobla ambos selects: materias y modalidades
  populateMateriasSelect();
  populateModalidadesSelect();

  // Si el usuario ya se logueó, carga sus inscripciones
  if (loggedUserId) {
    loadMaterias();
  }

  const btnOpenForm = document.getElementById("btnOpenForm");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnGuardar = document.getElementById("btnGuardar");
  const btnAgregarEvento = document.getElementById("btnAgregarEvento");

  btnOpenForm.addEventListener("click", () => {
    openFormModal();
  });

  btnCancelar.addEventListener("click", () => {
    closeFormModal();
    editingInscripcionId = null;
  });

  btnGuardar.addEventListener("click", () => {
    saveMateria();
  });

  btnAgregarEvento.addEventListener("click", () => {
    agregarEvento();
  });
});

// Función para poblar el select de materias globales
function populateMateriasSelect() {
  fetch("/db/materias/global")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("NombreMateria");
      if (select) {
        select.innerHTML = `<option value="">-- Seleccione una Materia --</option>`;
        data.forEach(materia => {
          const option = document.createElement("option");
          // Utilizamos el NombreMateria; si lo prefieres, podrías usar el idMateria
          option.value = materia.NombreMateria;
          option.text = materia.NombreMateria;
          select.appendChild(option);
        });
      }
    })
    .catch(err => console.error("Error al cargar materias globales:", err));
}

// Función para poblar el select de modalidades
function populateModalidadesSelect() {
  fetch("/db/modalidades")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("idModalidad");
      if (select) {
        select.innerHTML = `<option value="">-- Seleccione una Modalidad --</option>`;
        data.forEach(mod => {
          const option = document.createElement("option");
          // Se usa el idModalidad como valor
          option.value = mod.idModalidad;
          option.text = mod.Nombre;
          select.appendChild(option);
        });
      }
    })
    .catch(err => console.error("Error al cargar modalidades:", err));
}

function loadMaterias() {
  if (!loggedUserId) {
    console.error("El ID del usuario no está definido.");
    return;
  }
  // Consulta las inscripciones (materias que tiene el usuario)
  fetch(`/db/materias?idUsuario=${loggedUserId}`)
    .then(res => res.json())
    .then(data => {
      renderMaterias(data);
    })
    .catch(err => console.error(err));
}

function renderMaterias(inscripciones) {
  const table = document.getElementById("materiasTable");
  let tbody = table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }
  tbody.innerHTML = "";

  inscripciones.forEach(insc => {
    const nombre = insc.materia?.NombreMateria || "N/A";
    const id = insc.idMateriaUsuario;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nombre}</td>
      <td>
        <span class="detalles" onclick="showDetails(${id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
          </svg>
        </span>
        <span class="editar" onclick="editMateria(${id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207z"/>
          </svg>
        </span>
        <span class="eliminar" onclick="deleteMateria(${id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
          </svg>
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openFormModal() {
  populateMateriasSelect();
  populateModalidadesSelect();
  document.getElementById("form-modal").style.display = "flex";
}

function closeFormModal() {
  document.getElementById("form-modal").style.display = "none";
  clearForm();
  editingInscripcionId = null;
}

function clearForm() {
  document.getElementById("NombreMateria").selectedIndex = 0;
  const selectModalidad = document.getElementById("idModalidad");
  if (selectModalidad) {
    selectModalidad.selectedIndex = 0;
  }
  document.getElementById("eventos-container").innerHTML = `<h3>Eventos</h3>`;
}

function getMateriaFromForm() {
  // Obtiene el valor seleccionado del select de materias
  const selectMateria = document.getElementById("NombreMateria");
  const NombreMateria = selectMateria.value;
  // Obtiene otros campos globales (si los hay)
  const anio = document.getElementById("anio") ? document.getElementById("anio").value : "";
  const horario = document.getElementById("horario") ? document.getElementById("horario").value : "";
  const modalidad = document.getElementById("modalidad") ? document.getElementById("modalidad").value : "";
  const correlativasStr = document.getElementById("correlativas") ? document.getElementById("correlativas").value : "";
  const correlativas = correlativasStr ? correlativasStr.split(",").map(s => s.trim()) : "";

  // Obtiene el valor del select de modalidad global
  const selectModalidad = document.getElementById("idModalidad");
  const idModalidad = selectModalidad ? parseInt(selectModalidad.value) : null;

  // Recolecta los eventos agregados dinámicamente
  const eventos = [];
  document.querySelectorAll(".evento").forEach(eventoDiv => {
    const tipo = eventoDiv.querySelector(".tipo").value;
    const numero = parseInt(eventoDiv.querySelector(".numero").value);
    const temasAEstudiar = eventoDiv.querySelector(".temasAEstudiar").value;
    const estado = eventoDiv.querySelector(".estado").value;
    const fechaEntrega = eventoDiv.querySelector(".fechaEntrega").value;
    // Incluimos idModalidad en cada evento, tomando el global (puedes cambiar esto si cada evento tiene su modaliddad)
    eventos.push({ tipo, numero, temasAEstudiar, estado, fechaEntrega, idModalidad });
  });

  return {
    NombreMateria,
    anio,
    horario,
    modalidad,
    correlativas,
    eventos,
    idUsuario: loggedUserId
  };
}

function saveMateria() {
  const materiaData = getMateriaFromForm();
  if (!editingInscripcionId) {
    // Crear inscripción (POST)
    fetch("/db/materia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materiaData)
    })
      .then(response => response.json())
      .then(() => {
        loadMaterias();
        closeFormModal();
      })
      .catch(err => console.error(err));
  } else {
    // Actualizar inscripción (PUT)
    fetch(`/db/materia/${editingInscripcionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materiaData)
    })
      .then(response => response.json())
      .then(() => {
        loadMaterias();
        closeFormModal();
        editingInscripcionId = null;
      })
      .catch(err => console.error(err));
  }
}

function deleteMateria(id) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción eliminará el registro.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`/db/materia/${id}`, { method: "DELETE" })
        .then(response => {
          if (response.ok) {
            Swal.fire({
              title: 'Eliminado!',
              text: 'El registro ha sido eliminado exitosamente.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
            loadMaterias();
          } else {
            Swal.fire('Error', 'Error al eliminar la materia.', 'error');
          }
        })
        .catch(err => console.error(err));
    }
  });
}

function agregarEvento() {
  const eventosContainer = document.getElementById("eventos-container");
  const eventoDiv = document.createElement("div");
  eventoDiv.classList.add("evento");
  eventoDiv.innerHTML = `
    <label>Tipo: 
      <select class="tipo">
        <option value="Parcial 1">Parcial 1</option>
        <option value="Parcial 2">Parcial 2</option>
        <option value="Recuperatorio 1">Recuperatorio 1</option>
        <option value="Recuperatorio 2">Recuperatorio 2</option>
        <option value="Trabajo Practico">Trabajo Practico</option>
        <option value="Examen Final">Examen Final</option>
      </select>
    </label>
    <label>Número: <input type="number" class="numero" placeholder="Número"></label>
    <label>Temas a Estudiar: <input type="text" class="temasAEstudiar" placeholder="Temas"></label>
    <label>Estado: 
      <select class="estado">
        <option value="Pendiente">Pendiente</option>
        <option value="En curso">En curso</option>
        <option value="Finalizado">Finalizado</option>
      </select>
    </label>
    <label>Fecha de Entrega: <input type="date" class="fechaEntrega"></label>
    <button type="button" onclick="eliminarEvento(this)">Eliminar Evento</button>
  `;
  eventosContainer.appendChild(eventoDiv);
}

function eliminarEvento(button) {
  button.parentElement.remove();
}

function showDetails(id) {
  fetch(`/db/materia/${id}`)
    .then(res => res.json())
    .then(inscripcion => {
      const detailsContent = document.getElementById("details-content");
      detailsContent.innerHTML = `
        <p><strong>Materia:</strong> ${inscripcion.materia?.NombreMateria || "N/A"}</p>
        <p><strong>ID de inscripción:</strong> ${inscripcion.idMateriaUsuario}</p>
        <p><strong>Eventos:</strong></p>
      `;
      if (inscripcion.eventos && inscripcion.eventos.length > 0) {
        inscripcion.eventos.forEach(ev => {
          detailsContent.innerHTML += `<p>${ev.tipo} ${ev.numero}: ${ev.temasAEstudiar} - ${ev.estado} (Entrega: ${ev.fechaEntrega})</p>`;
        });
      } else {
        detailsContent.innerHTML += `<p>N/A</p>`;
      }
      document.getElementById("details-modal").style.display = "flex";
    })
    .catch(err => console.error(err));
}

function closeDetailsModal() {
  document.getElementById("details-modal").style.display = "none";
}

function showInfo() {
  Swal.fire({
    html: '<b>Alumnos:</b><br>' +
          'Barbara Carrizo<br>' +
          'Omar Brondo<br>' +
          'Karen Micaela Pelozo<br>' +
          'Pamela Chaparro<br>' +
          'Clara Cantarino<br><br>' +
          '<p><a href="https://onedrive.live.com/..." target="_blank" style="color:#3085d6;">Ver documentación</a></p>',
    confirmButtonText: 'Aceptar'
  });
}

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  
  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre: username, password: password })
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.error); });
      }
      return response.json();
    })
    .then(data => {
      loggedUserId = data.user.id;
      document.getElementById("login-modal").style.display = "none";
      const headerContainer = document.querySelector(".header-container");
      headerContainer.innerHTML += `<p style="color: #fff; margin-left: 10px;">Bienvenido, ${data.user.nombre} (${data.user.rol})</p>`;
      loadMaterias();
    })
    .catch(error => {
      Swal.fire({
        icon: "error",
        title: "Usuario incorrecto",
        text: error.message,
        confirmButtonText: "Aceptar"
      });
    });
}

function editMateria(id) {
  editingInscripcionId = id;
  document.getElementById("modal-title").innerText = "Editar Inscripción";
  
  fetch(`/db/materia/${id}`)
    .then(res => res.json())
    .then(inscripcion => {
      // Para la materia global, selecciona la opción en el select que coincida con el NombreMateria
      const selectMateria = document.getElementById("NombreMateria");
      if (inscripcion.materia && inscripcion.materia.NombreMateria) {
        Array.from(selectMateria.options).forEach(option => {
          option.selected = (option.value === inscripcion.materia.NombreMateria);
        });
      }
      // Aquí puedes agregar código para rellenar el select de modalidades si fuera necesario
      
      // Rellena los eventos:
      const eventosContainer = document.getElementById("eventos-container");
      eventosContainer.innerHTML = `<h3>Eventos</h3>`;
      if (inscripcion.eventos && inscripcion.eventos.length > 0) {
        inscripcion.eventos.forEach(ev => {
          const eventoDiv = document.createElement("div");
          eventoDiv.classList.add("evento");
          eventoDiv.innerHTML = `
            <label>Tipo:
              <select class="tipo">
                <option value="Parcial 1" ${ev.tipo === "Parcial 1" ? "selected" : ""}>Parcial 1</option>
                <option value="Parcial 2" ${ev.tipo === "Parcial 2" ? "selected" : ""}>Parcial 2</option>
                <option value="Recuperatorio 1" ${ev.tipo === "Recuperatorio 1" ? "selected" : ""}>Recuperatorio 1</option>
                <option value="Recuperatorio 2" ${ev.tipo === "Recuperatorio 2" ? "selected" : ""}>Recuperatorio 2</option>
                <option value="Trabajo Practico" ${ev.tipo === "Trabajo Practico" ? "selected" : ""}>Trabajo Practico</option>
                <option value="Examen Final" ${ev.tipo === "Examen Final" ? "selected" : ""}>Examen Final</option>
              </select>
            </label>
            <label>Número: <input type="number" class="numero" value="${ev.numero}" placeholder="Número"></label>
            <label>Temas a Estudiar: <input type="text" class="temasAEstudiar" value="${ev.temasAEstudiar}" placeholder="Temas"></label>
            <label>Estado:
              <select class="estado">
                <option value="Pendiente" ${ev.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
                <option value="En curso" ${ev.estado === "En curso" ? "selected" : ""}>En curso</option>
                <option value="Finalizado" ${ev.estado === "Finalizado" ? "selected" : ""}>Finalizado</option>
              </select>
            </label>
            <label>Fecha de Entrega: <input type="date" class="fechaEntrega" value="${ev.fechaEntrega}" placeholder="Fecha"></label>
            <button type="button" onclick="eliminarEvento(this)">Eliminar Evento</button>
          `;
          eventosContainer.appendChild(eventoDiv);
        });
      }
      openFormModal();
    })
    .catch(err => console.error(err));
}
