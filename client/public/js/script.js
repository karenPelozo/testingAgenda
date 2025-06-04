// test comentario Omar Brondo

let loggedUserId = null;
let editingInscripcionId = null;

document.addEventListener("DOMContentLoaded", () => {
  // Al cargar el DOM, pobla los selects: materias y modalidades
  populateMateriasSelect();
  populateModalidadesSelect();

  // Si el usuario ya se logueó, carga sus inscripciones
  if (loggedUserId) {
    loadMaterias();
  }

  // Actualiza automáticamente el campo correlativas cuando se selecciona una materia
  const selectMateria = document.getElementById("NombreMateria");
  if (selectMateria) {
    selectMateria.addEventListener("change", () => {
      populateCorrelativas(selectMateria.value);
    });
  }

  // Botones del formulario de materias
  const btnOpenForm = document.getElementById("btnOpenForm");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnGuardar = document.getElementById("btnGuardar");
  const btnAgregarEvento = document.getElementById("btnAgregarEvento");

  if (btnOpenForm) btnOpenForm.addEventListener("click", openFormModal);
  if (btnCancelar) btnCancelar.addEventListener("click", () => {
    closeFormModal();
    editingInscripcionId = null;
  });
  if (btnGuardar) btnGuardar.addEventListener("click", saveMateria);
  if (btnAgregarEvento) btnAgregarEvento.addEventListener("click", agregarEvento);
});

/* ============================
    Funciones para Materias y Eventos
============================ */

function populateMateriasSelect() {
  fetch("/db/materias/global")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("NombreMateria");
      if (select) {
        select.innerHTML = `<option value="">-- Seleccione una Materia --</option>`;
        data.forEach(materia => {
          const option = document.createElement("option");
          option.value = materia.idMateria;
          option.text = materia.NombreMateria;
          select.appendChild(option);
        });
      }
    })
    .catch(err => console.error("Error al cargar materias globales:", err));
}

function populateModalidadesSelect() {
  fetch("/db/modalidades")
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("idModalidad");
      if (select) {
        select.innerHTML = `<option value="">-- Seleccione una Modalidad --</option>`;
        data.forEach(mod => {
          const option = document.createElement("option");
          option.value = mod.idModalidad;
          option.text = mod.Nombre || mod.tipoModalidad;
          select.appendChild(option);
        });
      }
    })
    .catch(err => console.error("Error al cargar modalidades:", err));
}

function populateCorrelativas(idMateria) {
  fetch(`/db/correlativas/${idMateria}`)
    .then(res => res.json())
    .then(data => {
      const correlativasInput = document.getElementById("correlativas");
      if (correlativasInput) {
        let correlativasArray = [];
        if (Array.isArray(data)) {
          correlativasArray = data;
        } else if (data) {
          correlativasArray = [data];
        }
        if (correlativasArray.length > 0) {
          const nombres = correlativasArray.map(mat => mat.NombreMateria);
          correlativasInput.value = nombres.join(", ");
        } else {
          correlativasInput.value = "";
        }
      }
    })
    .catch(err => console.error("Error al cargar correlativas:", err));
}

function loadMaterias() {
  if (!loggedUserId) {
    console.error("El ID del usuario no está definido.");
    return;
  }
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
    const materiaNombre = insc.materia?.NombreMateria || "N/A";
    let anioDeCarrera = "",
        anio = "",
        horas = "",
        modalidad = "",
        correlativas = "",
        fechaExamen = "",
        notas = "";
    if (insc.eventos && insc.eventos.length > 0) {
      const ev = insc.eventos[0];
      anioDeCarrera = ev.anioDeCarrera || "";
      anio = ev.anio || "";
      horas = `${ev.horaInicio || ""}<br>${ev.horaFin || ""}`;
      modalidad = ev.modalidad && (ev.modalidad.Nombre || ev.modalidad.tipoModalidad)
                  ? (ev.modalidad.Nombre || ev.modalidad.tipoModalidad)
                  : "";
      correlativas = ev.correlativas || "";
      fechaExamen = ev.fechaExamen || "";
      notas = `P1: ${ev.notaParcial1 !== undefined ? ev.notaParcial1 : "N/A"}, ` +
              `P2: ${ev.notaParcial2 !== undefined ? ev.notaParcial2 : "N/A"}, ` +
              `Final: ${ev.notaFinal !== undefined ? ev.notaFinal : "N/A"}`;
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
        <button class="btn btn-info" onclick="showDetails(${insc.idMateriaUsuario})">
          <i class="bi bi-eye"></i>
        </button>
        <button class="btn btn-warning" onclick="editMateria(${insc.idMateriaUsuario})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-danger" onclick="deleteMateria(${insc.idMateriaUsuario})">
          <i class="bi bi-trash"></i>
        </button>
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
  const correlativasInput = document.getElementById("correlativas");
  if (correlativasInput) {
    correlativasInput.value = "";
  }
  document.getElementById("eventos-container").innerHTML = `<h3>Eventos</h3>`;
}

function editMateria(id) {
  editingInscripcionId = id;
  document.getElementById("modal-title").innerText = "Editar Inscripción";
  fetch(`/db/materia/${id}`)
    .then(res => res.json())
    .then(inscripcion => {
      const selectMateria = document.getElementById("NombreMateria");
      if (inscripcion.materia && inscripcion.materia.idMateria) {
        Array.from(selectMateria.options).forEach(option => {
          option.selected = (option.value == inscripcion.materia.idMateria);
        });
      }
      populateCorrelativas(inscripcion.materia.idMateria);
      if (inscripcion.eventos && inscripcion.eventos.length > 0) {
        const ev = inscripcion.eventos[0];
        document.getElementById("anioDeCarrera").value = ev.anioDeCarrera || "";
        document.getElementById("anio").value = ev.anio || "";
        document.getElementById("horaInicio").value = ev.horaInicio || "";
        document.getElementById("horaFin").value = ev.horaFin || "";
        document.getElementById("examen").value = ev.fechaExamen || "";
        document.getElementById("notaParcial1").value = ev.notaParcial1 || "";
        document.getElementById("notaParcial2").value = ev.notaParcial2 || "";
        document.getElementById("notaFinal").value = ev.notaFinal || "";
        document.getElementById("idModalidad").value = ev.idModalidad || "";
      }
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
            <label>Número: <input type="number" class="numero" value="${ev.numero || ''}" placeholder="Número"></label>
            <label>Temas a Estudiar: <input type="text" class="temasAEstudiar" value="${ev.temasAEstudiar || ''}" placeholder="Temas"></label>
            <label>Estado:
              <select class="estado">
                <option value="Pendiente" ${ev.estado === "Pendiente" ? "selected" : ""}>Pendiente</option>
                <option value="En curso" ${ev.estado === "En curso" ? "selected" : ""}>En curso</option>
                <option value="Finalizado" ${ev.estado === "Finalizado" ? "selected" : ""}>Finalizado</option>
              </select>
            </label>
            <label>Día:
              <select class="dia">
                <option value="Lunes" ${ev.dia === "Lunes" ? "selected" : ""}>Lunes</option>
                <option value="Martes" ${ev.dia === "Martes" ? "selected" : ""}>Martes</option>
                <option value="Miércoles" ${ev.dia === "Miércoles" ? "selected" : ""}>Miércoles</option>
                <option value="Jueves" ${ev.dia === "Jueves" ? "selected" : ""}>Jueves</option>
                <option value="Viernes" ${ev.dia === "Viernes" ? "selected" : ""}>Viernes</option>
                <option value="Sábado" ${ev.dia === "Sábado" ? "selected" : ""}>Sábado</option>
                <option value="Domingo" ${ev.dia === "Domingo" ? "selected" : ""}>Domingo</option>
              </select>
            </label>
            <label>Hora de Inicio: <input type="time" class="horaInicio" value="${ev.horaInicio || ''}"></label>
            <label>Hora de Fin: <input type="time" class="horaFin" value="${ev.horaFin || ''}"></label>
            <label>Fecha de Examen: <input type="date" class="fechaEntrega" value="${ev.fechaEntrega || ''}" placeholder="Fecha"></label>
            <button type="button" onclick="eliminarEvento(this)">Eliminar Evento</button>
          `;
          eventosContainer.appendChild(eventoDiv);
        });
      }
      openFormModal();
    })
    .catch(err => console.error("Error al recuperar la inscripción:", err));
}

function getMateriaFromForm() {
  const selectMateria = document.getElementById("NombreMateria");
  const idMateria = selectMateria.value;
  const NombreMateria = selectMateria.options[selectMateria.selectedIndex].text;
  const anioDeCarrera = document.getElementById("anioDeCarrera")
    ? document.getElementById("anioDeCarrera").value
    : "";
  const anio = document.getElementById("anio") ? document.getElementById("anio").value : "";
  const globalHoraInicio = document.getElementById("horaInicio")
    ? document.getElementById("horaInicio").value
    : "";
  const globalHoraFin = document.getElementById("horaFin")
    ? document.getElementById("horaFin").value
    : "";
  const examen = document.getElementById("examen") ? document.getElementById("examen").value : "";
  const notaParcial1 = document.getElementById("notaParcial1") ? document.getElementById("notaParcial1").value : "";
  const notaParcial2 = document.getElementById("notaParcial2") ? document.getElementById("notaParcial2").value : "";
  const notaFinal = document.getElementById("notaFinal") ? document.getElementById("notaFinal").value : "";
  const correlativasInput = document.getElementById("correlativas");
  const correlativa = correlativasInput ? correlativasInput.value : "";
  const selectModalidad = document.getElementById("idModalidad");
  const idModalidad = selectModalidad ? parseInt(selectModalidad.value) : null;
  
  const eventosDinamicos = [];
  document.querySelectorAll(".evento").forEach(eventoDiv => {
    const tipo = eventoDiv.querySelector(".tipo") ? eventoDiv.querySelector(".tipo").value : "";
    const numeroVal = eventoDiv.querySelector(".numero") ? eventoDiv.querySelector(".numero").value : "";
    const numero = numeroVal !== "" ? parseInt(numeroVal) : null;
    const temasAEstudiar = eventoDiv.querySelector(".temasAEstudiar") ? eventoDiv.querySelector(".temasAEstudiar").value : "";
    const estado = eventoDiv.querySelector(".estado") ? eventoDiv.querySelector(".estado").value : "";
    const fechaEntrega = eventoDiv.querySelector(".fechaEntrega") ? eventoDiv.querySelector(".fechaEntrega").value : "";
    const dia = eventoDiv.querySelector(".dia") ? eventoDiv.querySelector(".dia").value : "";
    const horaInicio_evento = eventoDiv.querySelector(".horaInicio") ? eventoDiv.querySelector(".horaInicio").value : globalHoraInicio;
    const horaFin_evento = eventoDiv.querySelector(".horaFin") ? eventoDiv.querySelector(".horaFin").value : globalHoraFin;
    
    eventosDinamicos.push({ 
      tipo, 
      numero, 
      temasAEstudiar, 
      estado, 
      fechaEntrega, 
      anioDeCarrera, 
      anio, 
      horaInicio: horaInicio_evento, 
      horaFin: horaFin_evento, 
      idModalidad, 
      correlativas: correlativa, 
      fechaExamen: examen, 
      notaParcial1, 
      notaParcial2, 
      notaFinal,
      dia
    });
  });
  
  console.log("Eventos dinámicos:", eventosDinamicos);
  
  const eventos = eventosDinamicos.length > 0 ? eventosDinamicos : [{
    tipo: "",
    numero: 0,
    temasAEstudiar: "",
    estado: "",
    fechaEntrega: "",
    anioDeCarrera,
    anio,
    horaInicio: globalHoraInicio,
    horaFin: globalHoraFin,
    idModalidad,
    correlativas: correlativa,
    fechaExamen: examen,
    notaParcial1,
    notaParcial2,
    notaFinal,
    dia: ""
  }];
  
  return {
    NombreMateria,
    idMateria,
    eventos,
    idUsuario: loggedUserId
  };
}

function saveMateria() {
  const materiaData = getMateriaFromForm();
  if (!editingInscripcionId) {
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
    <label>Día: 
      <select class="dia">
        <option value="Lunes">Lunes</option>
        <option value="Martes">Martes</option>
        <option value="Miércoles">Miércoles</option>
        <option value="Jueves">Jueves</option>
        <option value="Viernes">Viernes</option>
        <option value="Sábado">Sábado</option>
        <option value="Domingo">Domingo</option>
      </select>
    </label>
    <label>Hora de Inicio: <input type="time" class="horaInicio"></label>
    <label>Hora de Fin: <input type="time" class="horaFin"></label>
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
        inscripcion.eventos.forEach((ev, index) => {
          detailsContent.innerHTML += `
            <h4>Evento ${index + 1}</h4>
            <p><strong>Tipo:</strong> ${ev.tipo || ""}</p>
            <p><strong>Día:</strong> ${ev.dia || ""}</p>
            <p><strong>Hora de Inicio:</strong> ${ev.horaInicio || ""}</p>
            <p><strong>Hora de Fin:</strong> ${ev.horaFin || ""}</p>
            <p><strong>Año de Carrera (Evento):</strong> ${ev.anioDeCarrera || ""}</p>
            <p><strong>Año (Evento):</strong> ${ev.anio || ""}</p>
            <p><strong>Modalidad (Evento):</strong> ${ev.modalidad && (ev.modalidad.Nombre || ev.modalidad.tipoModalidad) ? (ev.modalidad.Nombre || ev.modalidad.tipoModalidad) : ""}</p>
            <p><strong>Correlativas (Evento):</strong> ${ev.correlativas || ""}</p>
            <p><strong>Fecha de Examen:</strong> ${ev.fechaExamen || ""}</p>
            <p><strong>Notas:</strong> P1: ${ev.notaParcial1 || "N/A"}, P2: ${ev.notaParcial2 || "N/A"}, Final: ${ev.notaFinal || "N/A"}</p>
            <hr>
          `;
        });
      } else {
        detailsContent.innerHTML += `<p><strong>Eventos:</strong> N/A</p>`;
      }
      document.getElementById("details-modal").style.display = "flex";
    })
    .catch(err => console.error("Error al recuperar la inscripción:", err));
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

/* ============================
   Funciones para Usuarios (Administración)
============================ */

function mostrarFormularioAltaUsuario() {
  document.getElementById("modalUsuario").style.display = "block";
}

function cerrarModalUsuario() {
  document.getElementById("modalUsuario").style.display = "none";
  document.getElementById("nombreUsuario").value = "";
  document.getElementById("passwordUsuario").value = "";
  document.getElementById("rolUsuario").value = "";
}

function guardarUsuario() {
  const nombre = document.getElementById("nombreUsuario").value;
  const password = document.getElementById("passwordUsuario").value;
  const rol = document.getElementById("rolUsuario").value;

  if (!nombre || !password || !rol) {
    alert("Complete todos los campos.");
    return;
  }

  fetch("/db/usuarios", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-admin": "true"  // Para pasar el middleware de admin en pruebas
    },
    body: JSON.stringify({ nombre, password, rol })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        alert("Usuario creado exitosamente");
        cargarUsuarios();
        document.getElementById("formUsuario").reset();
        cerrarModalUsuario();
      }
    })
    .catch(err => console.error("Error al guardar usuario:", err));
}

function cargarUsuarios() {
  const tbody = document.getElementById("usuariosTable").querySelector("tbody");
  fetch("/db/usuarios", { 
      headers: { "x-admin": "true" }
    })
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data)) {
        tbody.innerHTML = "";
        data.forEach(usuario => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${usuario.id}</td>
            <td>${usuario.nombre}</td>
            <td>${usuario.rol}</td>
            <td>
              <button onclick="editarUsuario(${usuario.id})" class="btn btn-warning">
                <i class="bi bi-pencil"></i>
              </button>
              <button onclick="eliminarUsuario(${usuario.id})" class="btn btn-danger">
                <i class="bi bi-trash"></i>
              </button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        console.error("Error: la respuesta no es un array", data);
      }
    })
    .catch(err => console.error("Error al cargar usuarios:", err));
}

function editarUsuario(id) {
  alert("Editar usuario con ID: " + id);
  // Podés implementar la lógica para editar usuario, por ejemplo, abriendo un modal de edición.
}

function eliminarUsuario(id) {
  if (confirm("¿Está seguro de eliminar este usuario?")) {
    fetch(`/db/usuarios/${id}`, {
      method: "DELETE",
      headers: { "x-admin": "true" }
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || "Usuario eliminado");
        cargarUsuarios();
      })
      .catch(err => console.error("Error al eliminar usuario:", err));
  }
}

/* ============================
   Función de Login
============================ */

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

      const nombre = data.user.nombre;
      const rol = data.user.rol.toLowerCase();
      const headerContainer = document.querySelector(".header-container");
      if (rol === "administrador" || rol === "admin") {
        headerContainer.innerHTML += `<p style="color: #fff; margin-left: 10px;">(administrador)</p>`;
      }
      
      // Usamos Toastify para el mensaje (asegúrate de tenerlo incluido, de lo contrario usa alert)
      Toastify({
        text: `Bienvenid@, ${nombre}`,
        duration: 4000,
        gravity: "top",
        position: "right",
        backgroundColor: "#b78ef1",
        close: true,
      }).showToast();

      // Si es admin, se podría redirigir o mostrar el panel de usuarios aquí.
      // Por ejemplo, si quieres redirigir a admin.html:
      if (rol === 'administrador') {
         window.location.href = "admin.html";
         return;
      }

      // Si no redirigís, muestra la sección de administración en el index (si la hay)
      if (rol === "administrador") {
        document.getElementById("adminUsuarios").style.display = "block";
        cargarUsuarios();
      }
      
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
