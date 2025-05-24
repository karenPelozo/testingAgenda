// test comentario Omar Brondo

// Variable global para almacenar el ID del usuario logueado
let loggedUserId = null;
let editingMateriaId = null;

document.addEventListener("DOMContentLoaded", () => {
  // Intenta cargar materias solo si el usuario ya está logueado
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
    editingMateriaId = null;
  });

  btnGuardar.addEventListener("click", () => {
    saveMateria();
  });

  btnAgregarEvento.addEventListener("click", () => {
    agregarEvento();
  });
});

function loadMaterias() {
  if (!loggedUserId) {
    console.error("El ID del usuario no está definido.");
    return;
  }

  // Se consulta el endpoint con el parámetro userId obtenido de la variable global
  fetch(`/db/materias?userId=${loggedUserId}`)
    .then((res) => res.json())
    .then((data) => {
      renderMaterias(data);
    })
    .catch((err) => console.error(err));
}

function renderMaterias(materias) {
  const table = document.getElementById("materiasTable");
  let tbody = table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }
  tbody.innerHTML = "";

  materias.forEach((materia) => {
    const nombre = materia.nombre || "N/A";
    const anioDeCarrera =
      materia.anioDeCarrera !== undefined && materia.anioDeCarrera !== null
        ? materia.anioDeCarrera
        : "N/A";
    const anio = materia.anio || "N/A";
    const horario = materia.horario || "N/A";
    const modalidad = materia.modalidad || "N/A";
    const correlativas =
      Array.isArray(materia.correlativas) && materia.correlativas.length > 0
        ? materia.correlativas.join(", ")
        : "N/A";
    const examenFecha = materia.examen || "N/A";
    let notasResumen = "N/A";
    if (
      materia.notaParcial1 !== undefined ||
      materia.notaParcial2 !== undefined ||
      materia.notaFinal !== undefined
    ) {
      notasResumen = `P1: ${materia.notaParcial1 || "N/A"}, P2: ${materia.notaParcial2 || "N/A"}, Final: ${materia.notaFinal || "N/A"}`;
    } else if (materia.notas) {
      notasResumen = `P1: ${materia.notas.parcial1}, P2: ${materia.notas.parcial2}, Final: ${materia.notas.final}`;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${nombre}</td>
      <td>${anioDeCarrera}</td>
      <td>${anio}</td>
      <td>${horario}</td>
      <td>${modalidad}</td>
      <td>${correlativas}</td>
      <td>${examenFecha}</td>
      <td>${notasResumen}</td>
      <td>
        <span class="detalles" onclick="showDetails(${materia.id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
          </svg>
        </span>
        <span class="editar" onclick="editMateria(${materia.id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-fill" viewBox="0 0 16 16">
            <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"/>
          </svg>
        </span>
        <span class="eliminar" onclick="deleteMateria(${materia.id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
          </svg>
        </span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openFormModal() {
  document.getElementById("form-modal").style.display = "flex";
}

function closeFormModal() {
  document.getElementById("form-modal").style.display = "none";
  clearForm();
  editingMateriaId = null;
}

function clearForm() {
  document.getElementById("materia").value = "";
  document.getElementById("anioDeCarrera").value = "";
  document.getElementById("anio").value = "";
  document.getElementById("modalidad").value = "Presencial";
  document.getElementById("correlativas").value = "";
  document.getElementById("dia").value = "Lunes";
  document.getElementById("horaInicio").value = "";
  document.getElementById("horaFin").value = "";
  document.getElementById("examen").value = "";
  document.getElementById("notaParcial1").value = "";
  document.getElementById("notaParcial2").value = "";
  document.getElementById("notaFinal").value = "";
  document.getElementById("eventos-container").innerHTML = `<h3>Eventos</h3>`;
}

function getMateriaFromForm() {
  const nombre = document.getElementById("materia").value;
  const anioDeCarrera = document.getElementById("anioDeCarrera").value;
  const anio = document.getElementById("anio").value;
  const modalidad = document.getElementById("modalidad").value;
  const correlativasStr = document.getElementById("correlativas").value;
  const correlativas = correlativasStr
    ? correlativasStr.split(",").map((s) => s.trim())
    : [];

  const dia = document.getElementById("dia").value;
  const horaInicio = document.getElementById("horaInicio").value;
  const horaFin = document.getElementById("horaFin").value;
  const horario =
    dia && horaInicio && horaFin ? `${dia} ${horaInicio} - ${horaFin}` : "N/A";

  const examen = document.getElementById("examen").value;
  const notaParcial1 = document.getElementById("notaParcial1").value;
  const notaParcial2 = document.getElementById("notaParcial2").value;
  const notaFinal = document.getElementById("notaFinal").value;

  // Recolecta los eventos agregados dinámicamente
  const eventos = [];
  document.querySelectorAll(".evento").forEach((eventoDiv) => {
    const tipo = eventoDiv.querySelector(".tipo").value;
    const numero = parseInt(eventoDiv.querySelector(".numero").value);
    const temasAEstudiar = eventoDiv.querySelector(".temasAEstudiar").value;
    const estado = eventoDiv.querySelector(".estado").value;
    const fechaEntrega = eventoDiv.querySelector(".fechaEntrega").value;
    eventos.push({ tipo, numero, temasAEstudiar, estado, fechaEntrega });
  });

  // Usamos la variable global loggedUserId en vez de localStorage.
  return {
    nombre,
    anioDeCarrera: anioDeCarrera ? parseInt(anioDeCarrera) : null,
    anio,
    horario,
    modalidad,
    correlativas,
    examen,
    notas: {
      parcial1: notaParcial1 ? parseFloat(notaParcial1) : null,
      parcial2: notaParcial2 ? parseFloat(notaParcial2) : null,
      final: notaFinal ? parseFloat(notaFinal) : null,
    },
    eventos,
    userId: loggedUserId
  };
}

function saveMateria() {
  const materiaData = getMateriaFromForm();

  if (!editingMateriaId) {
    // Creación de una nueva materia usando la DB
    fetch("/db/materia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materiaData),
    })
      .then((response) => response.json())
      .then(() => {
        loadMaterias();
        closeFormModal();
      })
      .catch((err) => console.error(err));
  } else {
    // Edición de una materia existente usando la DB
    fetch(`/db/materia/${editingMateriaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materiaData),
    })
      .then((response) => response.json())
      .then(() => {
        loadMaterias();
        closeFormModal();
        editingMateriaId = null;
      })
      .catch((err) => console.error(err));
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
        .then((response) => {
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
        .catch((err) => console.error(err));
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
    .then((res) => res.json())
    .then((materia) => {
      const detailsContent = document.getElementById("details-content");
      detailsContent.innerHTML = `
        <p><strong>Materia:</strong> ${materia.nombre || "N/A"}</p>
        <p><strong>Año de Carrera:</strong> ${materia.anioDeCarrera || "N/A"}</p>
        <p><strong>Año:</strong> ${materia.anio || "N/A"}</p>
        <p><strong>Horario:</strong> ${materia.horario || "N/A"}</p>
        <p><strong>Modalidad:</strong> ${materia.modalidad || "N/A"}</p>
        <p><strong>Correlativas:</strong> ${Array.isArray(materia.correlativas) ? materia.correlativas.join(", ") : "N/A"}</p>
        <p><strong>Fecha de Examen:</strong> ${materia.examen || "N/A"}</p>
        <p><strong>Notas:</strong> ${
          (materia.notaParcial1 || materia.notaParcial2 || materia.notaFinal)
            ? `P1: ${materia.notaParcial1}, P2: ${materia.notaParcial2}, Final: ${materia.notaFinal}`
            : "N/A"
        }</p>
        <p><strong>Eventos:</strong></p>
      `;
      if (materia.eventos && materia.eventos.length > 0) {
        materia.eventos.forEach((ev) => {
          detailsContent.innerHTML += `<p>${ev.tipo} ${ev.numero}: ${ev.temasAEstudiar} - ${ev.estado} (Entrega: ${ev.fechaEntrega})</p>`;
        });
      } else {
        detailsContent.innerHTML += `<p>N/A</p>`;
      }
      document.getElementById("details-modal").style.display = "flex";
    })
    .catch((err) => console.error(err));
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
      // En vez de guardar en localStorage, asignamos a la variable global
      loggedUserId = data.user.id;
      document.getElementById("login-modal").style.display = "none";
      const headerContainer = document.querySelector(".header-container");
      headerContainer.innerHTML += `<p style="color: #fff; margin-left: 10px;">Bienvenido, ${data.user.nombre} (${data.user.rol})</p>`;
      
      // Cargamos las materias del usuario
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
  editingMateriaId = id;
  document.getElementById("modal-title").innerText = "Editar Registro";

  fetch(`/db/materia/${id}`)
    .then((res) => res.json())
    .then((materia) => {
      document.getElementById("materia").value = materia.nombre || "";
      document.getElementById("anioDeCarrera").value = materia.anioDeCarrera || "";
      document.getElementById("anio").value = materia.anio || "";
      document.getElementById("modalidad").value = materia.modalidad || "Presencial";
      document.getElementById("correlativas").value = Array.isArray(materia.correlativas) ? materia.correlativas.join(", ") : "";

      if (materia.horario && materia.horario !== "N/A") {
        const parts = materia.horario.split(" ");
        document.getElementById("dia").value = parts[0] || "Lunes";
        document.getElementById("horaInicio").value = parts[1] || "";
        document.getElementById("horaFin").value = parts[3] || "";
      } else {
        document.getElementById("dia").value = "Lunes";
        document.getElementById("horaInicio").value = "";
        document.getElementById("horaFin").value = "";
      }

      document.getElementById("examen").value = materia.examen || "";
      document.getElementById("notaParcial1").value = materia.notaParcial1 || "";
      document.getElementById("notaParcial2").value = materia.notaParcial2 || "";
      document.getElementById("notaFinal").value = materia.notaFinal || "";

      const eventosContainer = document.getElementById("eventos-container");
      eventosContainer.innerHTML = `<h3>Eventos</h3>`;
      if (materia.eventos && materia.eventos.length > 0) {
        materia.eventos.forEach((ev) => {
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
    .catch((err) => console.error(err));
}
