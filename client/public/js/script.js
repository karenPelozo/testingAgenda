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
          // Se utiliza el NombreMateria; también podrías definir option.value = materia.idMateria
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
          // Si tu modelo Modalidad define "tipoModalidad", posiblemente debas usar mod.tipoModalidad en lugar de mod.Nombre.
          option.value = mod.idModalidad;
          option.text = mod.Nombre || mod.tipoModalidad; 
          select.appendChild(option);
        });
      }
    })
    .catch(err => console.error("Error al cargar modalidades:", err));
}

// Función para cargar (GET) los registros
function loadMaterias() {
  if (!loggedUserId) {
    console.error("El ID del usuario no está definido.");
    return;
  }
  // Se consulta el endpoint que devuelve la unión de MateriaUsuario y Evento (junto con la Materia)
  fetch(`/db/materias?idUsuario=${loggedUserId}`)
    .then(res => res.json())
    .then(data => {
      renderMaterias(data);
    })
    .catch(err => console.error(err));
}

// Función para renderizar la tabla
function renderMaterias(inscripciones) {
  const table = document.getElementById("materiasTable");
  let tbody = table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }
  tbody.innerHTML = "";

  inscripciones.forEach(insc => {
    const materiaNombre = insc.materia?.NombreMateria || "N/A";

    let anioDeCarrera = "";
    let anio = "";
    let horas = ""; // Se mostrará horaInicio y horaFin en dos líneas.
    let modalidad = "";
    let correlativas = "";
    let fechaExamen = "";
    let notas = "";
    
    if (insc.eventos && insc.eventos.length > 0) {
      const ev = insc.eventos[0];
      anioDeCarrera = ev.anioDeCarrera || "";
      anio = ev.anio || "";
      // Mostrar las horas en dos líneas
      horas = `${ev.horaInicio || ""}<br>${ev.horaFin || ""}`;
      modalidad = (ev.modalidad && (ev.modalidad.Nombre || ev.modalidad.tipoModalidad)) ? (ev.modalidad.Nombre || ev.modalidad.tipoModalidad) : "";
      correlativas = ev.correlativas || "";
      fechaExamen = ev.fechaExamen || "";
      notas = `P1: ${ev.notaParcial1 !== undefined ? ev.notaParcial1 : "N/A"}, P2: ${ev.notaParcial2 !== undefined ? ev.notaParcial2 : "N/A"}, Final: ${ev.notaFinal !== undefined ? ev.notaFinal : "N/A"}`;
    }
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${materiaNombre}</td>
      <td>${anioDeCarrera}</td>
      <td>${anio}</td>
      <td>${horas}</td>
      <td>${modalidad}</td>
      <td>${correlativas}</td>
      <td>${fechaExamen}</td>
      <td>${notas}</td>
      <td>
        <button onclick="showDetails(${insc.idMateriaUsuario})">Detalles</button>
        <button onclick="editMateria(${insc.idMateriaUsuario})">Editar</button>
        <button onclick="deleteMateria(${insc.idMateriaUsuario})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Función para abrir el modal del formulario
function openFormModal() {
  populateMateriasSelect();
  populateModalidadesSelect();
  document.getElementById("form-modal").style.display = "flex";
}

// Función para cerrar el formulario
function closeFormModal() {
  document.getElementById("form-modal").style.display = "none";
  clearForm();
  editingInscripcionId = null;
}

// Limpia el formulario
function clearForm() {
  document.getElementById("NombreMateria").selectedIndex = 0;
  const selectModalidad = document.getElementById("idModalidad");
  if (selectModalidad) {
    selectModalidad.selectedIndex = 0;
  }
  document.getElementById("eventos-container").innerHTML = `<h3>Eventos</h3>`;
}

// Función para obtener los datos del formulario
function getMateriaFromForm() {
  // Obtiene el valor del select de materias
  const selectMateria = document.getElementById("NombreMateria");
  const NombreMateria = selectMateria.value;
  
  // Obtiene los campos globales que se usarán para los eventos
  const anioDeCarrera = document.getElementById("anioDeCarrera") ? document.getElementById("anioDeCarrera").value : "";
  const anio = document.getElementById("anio") ? document.getElementById("anio").value : "";
  
  // Extraer los valores de horaInicio y horaFin
  const horaInicio = document.getElementById("horaInicio") ? document.getElementById("horaInicio").value : "";
  const horaFin = document.getElementById("horaFin") ? document.getElementById("horaFin").value : "";
  
  const examen = document.getElementById("examen") ? document.getElementById("examen").value : "";
  const notaParcial1 = document.getElementById("notaParcial1") ? document.getElementById("notaParcial1").value : "";
  const notaParcial2 = document.getElementById("notaParcial2") ? document.getElementById("notaParcial2").value : "";
  const notaFinal = document.getElementById("notaFinal") ? document.getElementById("notaFinal").value : "";
  const correlativas = document.getElementById("correlativas") ? document.getElementById("correlativas").value : "";
  
  // Obtiene el valor del select de modalidades
  const selectModalidad = document.getElementById("idModalidad");
  const idModalidad = selectModalidad ? parseInt(selectModalidad.value) : null;
  
  // Recolecta los eventos agregados dinámicamente
  const eventosDinamicos = [];
  document.querySelectorAll(".evento").forEach(eventoDiv => {
    const tipo = eventoDiv.querySelector(".tipo").value;
    const numero = parseInt(eventoDiv.querySelector(".numero").value);
    const temasAEstudiar = eventoDiv.querySelector(".temasAEstudiar").value;
    const estado = eventoDiv.querySelector(".estado").value;
    const fechaEntrega = eventoDiv.querySelector(".fechaEntrega").value;
    eventosDinamicos.push({ 
      tipo, 
      numero, 
      temasAEstudiar, 
      estado, 
      fechaEntrega, 
      anioDeCarrera, 
      anio, 
      horaInicio, 
      horaFin, 
      idModalidad, 
      correlativas, 
      fechaExamen: examen, 
      notaParcial1, 
      notaParcial2, 
      notaFinal 
    });
  });
  
  // Si no se agregaron eventos dinámicos, crea uno usando los valores globales
  const eventos = eventosDinamicos.length > 0 ? eventosDinamicos : [{
    tipo: "",
    numero: 0,
    temasAEstudiar: "",
    estado: "",
    fechaEntrega: "",
    anioDeCarrera,
    anio,
    horaInicio,
    horaFin,
    idModalidad,
    correlativas,
    fechaExamen: examen,
    notaParcial1,
    notaParcial2,
    notaFinal
  }];
  
  return {
    NombreMateria,
    eventos,
    idUsuario: loggedUserId
  };
}

// Función para guardar (POST o PUT según corresponda)
function saveMateria() {
  const materiaData = getMateriaFromForm();
  if (!editingInscripcionId) {
    // Crear registro (POST)
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
    // Actualizar registro (PUT)
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
  }).then(result => {
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
      `;
      if (inscripcion.eventos && inscripcion.eventos.length > 0) {
        const ev = inscripcion.eventos[0];
        detailsContent.innerHTML += `
          <p><strong>Año de Carrera (Evento):</strong> ${ev.anioDeCarrera || ""}</p>
          <p><strong>Año (Evento):</strong> ${ev.anio || ""}</p>
          <p><strong>Horario (Evento):</strong> ${ev.horaInicio || ""} - ${ev.horaFin || ""}</p>
          <p><strong>Modalidad (Evento):</strong> ${(ev.modalidad && (ev.modalidad.Nombre || ev.modalidad.tipoModalidad)) ? (ev.modalidad.Nombre || ev.modalidad.tipoModalidad) : ""}</p>
          <p><strong>Correlativas (Evento):</strong> ${ev.correlativas || ""}</p>
          <p><strong>Fecha de Examen:</strong> ${ev.fechaExamen || ""}</p>
          <p><strong>Notas:</strong> P1: ${ev.notaParcial1 || "N/A"}, P2: ${ev.notaParcial2 || "N/A"}, Final: ${ev.notaFinal || "N/A"}</p>
        `;
      } else {
        detailsContent.innerHTML += `<p><strong>Eventos:</strong> N/A</p>`;
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
      // Selecciona la materia global en el select
      const selectMateria = document.getElementById("NombreMateria");
      if (inscripcion.materia && inscripcion.materia.NombreMateria) {
        Array.from(selectMateria.options).forEach(option => {
          option.selected = (option.value === inscripcion.materia.NombreMateria);
        });
      }
      // Rellena los campos globales según los datos del primer evento
      if (inscripcion.eventos && inscripcion.eventos.length > 0) {
        const ev = inscripcion.eventos[0];
        if (document.getElementById("anioDeCarrera"))
          document.getElementById("anioDeCarrera").value = ev.anioDeCarrera || "";
        if (document.getElementById("anio"))
          document.getElementById("anio").value = ev.anio || "";
        // En vez de "horario", se asignan horaInicio y horaFin
        if (document.getElementById("horaInicio"))
          document.getElementById("horaInicio").value = ev.horaInicio || "";
        if (document.getElementById("horaFin"))
          document.getElementById("horaFin").value = ev.horaFin || "";
        if (document.getElementById("examen"))
          document.getElementById("examen").value = ev.fechaExamen || "";
        if (document.getElementById("notaParcial1"))
          document.getElementById("notaParcial1").value = ev.notaParcial1 || "";
        if (document.getElementById("notaParcial2"))
          document.getElementById("notaParcial2").value = ev.notaParcial2 || "";
        if (document.getElementById("notaFinal"))
          document.getElementById("notaFinal").value = ev.notaFinal || "";
        if (document.getElementById("correlativas"))
          document.getElementById("correlativas").value = ev.correlativas || "";
        // Selecciona la modalidad si existe
        if (document.getElementById("idModalidad") && ev.modalidad && ev.modalidad.idModalidad) {
          document.getElementById("idModalidad").value = ev.modalidad.idModalidad;
        }
      }
      
      // Rellena los eventos dinámicos
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

