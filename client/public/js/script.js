// ——— 1 · Variables globales ———
let loggedUserId       = null;
let editingInscripcionId = null;

// ——— 2 · Helpers ———
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

// ——— 3 · DOM Ready ———

document.addEventListener("DOMContentLoaded", () => {

  const loginModal        = document.getElementById("login-modal");
  const logoutBtn         = document.getElementById("logoutBtn");
  const btnOpenForm       = document.getElementById("btnOpenForm");
  const btnCancelar       = document.getElementById("btnCancelar");
  const btnGuardar        = document.getElementById("btnGuardar");
  const btnAgregarEvento  = document.getElementById("btnAgregarEvento");
  const btnNotif          = document.getElementById("btnNotifications");
  const panelNotif        = document.getElementById("notificationsList");
  const modalNotif        = document.getElementById("modalNotificaciones");
  const closeNotifModal   = document.getElementById("closeNotifModal");
  const notifList         = document.getElementById("notifList");
  const btnImprimir       = document.getElementById("btnImprimir");
  const formModal         = document.getElementById("form-modal");
  const modalTitle        = document.getElementById("modal-title");
  const eventosContainer  = document.getElementById("eventos-container");

  // — Inicialización según sesión —
  const userJson = localStorage.getItem("user");
  if (!userJson) {
    if (loginModal) loginModal.style.display = "flex";
  } else {
    const user = JSON.parse(userJson);
    loggedUserId = user.id;
    if (loginModal) loginModal.style.display = "none";
    if (logoutBtn)  logoutBtn.style.display = "inline-block";

    if (user.rol.toLowerCase() === "administrador") {
      cargarUsuarios();
      cargarMateriasAdmin();
    }
    populateMateriasSelect();
    populateModalidadesSelect();
    loadMaterias();
  }

  // — 1) “Nuevo”: limpio todo y abro form —
  if (btnOpenForm) {
    btnOpenForm.addEventListener("click", e => {
      e.preventDefault();
      // resetear edición
      editingInscripcionId = null;
      if (modalTitle) modalTitle.innerText = "Nueva Inscripción";

      // 1.1) Limpio selects + correlativas + container dinámico
      clearForm(); // tu función existente limpia NombreMateria, idModalidad, correlativas y eventos
      eventosContainer.innerHTML = "<h3>Eventos</h3>";

      // 1.2) Limpio inputs estáticos extra
      ["anioDeCarrera","anio","horaInicio","horaFin",
       "examen","notaParcial1","notaParcial2","notaFinal"]
        .forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = "";
        });

      // 1.3) Vuelvo a poblar selects
      populateMateriasSelect();
      populateModalidadesSelect();

      // 1.4) Finalmente muestro el modal
      if (formModal) formModal.style.display = "flex";
    });
  }

  // — 2) Botones del form existente —
  if (btnCancelar) btnCancelar.addEventListener("click", e => {
    e.preventDefault();
    closeFormModal();
    editingInscripcionId = null;
  });
  if (btnGuardar)        btnGuardar.addEventListener("click", saveMateria);
  if (btnAgregarEvento)  btnAgregarEvento.addEventListener("click", agregarEvento);

  // — 3) Notificaciones: toggle + modal —
  if (btnNotif && modalNotif && closeNotifModal && notifList) {
    btnNotif.addEventListener("click", async () => {
      const visible = window.getComputedStyle(modalNotif).display !== "none";
      if (visible) {
        modalNotif.style.display = "none";
        return;
      }
      try {
        const eventos = await obtenerProximosEventos();
        notifList.innerHTML = eventos.length
          ? eventos.map(ev => {
              const fecha = ev.fechaEntrega || ev.fechaExamen || "—";
              return `
                <li>
                  <strong>${ev.tipo}</strong><br>
                  Día: ${ev.dia || "—"} · Fecha: ${fecha}
                </li>
              `;
            }).join("")
          : "<li>No hay eventos próximos.</li>";
        modalNotif.style.display = "flex";
      } catch (err) {
        console.error("Error trayendo notificaciones:", err);
      }
    });

    closeNotifModal.addEventListener("click", () => {
      modalNotif.style.display = "none";
    });
    modalNotif.addEventListener("click", e => {
      if (e.target === modalNotif) modalNotif.style.display = "none";
    });
  }

  // — 4) Generar PDF —
  if (btnImprimir) {
    btnImprimir.addEventListener("click", () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF("p","pt","a4");
      doc.setFontSize(18);
      doc.text("Reporte de Materias y Eventos", 40, 50);

      const head = [["Materia","Año","Modalidad","Eventos"]];
      const body = [];
      document.querySelectorAll("#materiasTable tbody tr")
        .forEach(tr => {
          const td = tr.querySelectorAll("td");
          body.push([
            td[0]?.textContent||"N/A",
            td[1]?.textContent||"",
            td[4]?.textContent||"",
            td[6]?.textContent||"—"
          ]);
        });

      doc.autoTable({ startY: 80, head, body, theme: "grid", styles: { fontSize: 11 } });
      doc.save("reporte-materias.pdf");
    });
  }



//Calcular nota final

 function calcularNotaFinal() {
    // Obtener valores como números válidos
    const np1 = Number(notaParcial1.value.trim()) || 0;
    const np2 = Number(notaParcial2.value.trim()) || 0;

    // Validar notas antes de calcular
    if (np1 < 7 || np2 < 7) {
      notaFinal.value = ""; // Lo vacía
      notaFinal.placeholder = "Debe recuperar"; // Mensaje visible pero no rompe input
      return;
    }

    // Si ambas notas >=7, calcular promedio redondeado arriba
    const promedio = (np1 + np2) / 2;
    notaFinal.value = Math.ceil(promedio);
  }

  if (notaParcial1 && notaParcial2 && notaFinal) {
    notaParcial1.addEventListener("input", calcularNotaFinal);
    notaParcial2.addEventListener("input", calcularNotaFinal);
  }
});


function renderChart({ materiasAprobadas, materiasPendientes }) {
  new Chart(document.getElementById('dashboardChart'), {
    type: 'doughnut',
    data: {
      labels: ['Aprobadas','Pendientes'],
      datasets: [{
        data: [materiasAprobadas, materiasPendientes],
        backgroundColor: ['#4caf50','#f44336']
      }]
    }
  });
}



let dashboardChart;

// 2) Función que pide stats y refresca DOM + gráfico
async function loadStats() {
  try {
    const res   = await fetch("/db/estadisticas", { headers: authHeaders() });
    const stats = await res.json();

    // Pinto los números
    document.getElementById("totalMaterias").textContent      = stats.totalMaterias;
    document.getElementById("materiasAprobadas").textContent  = stats.materiasAprobadas;
    document.getElementById("materiasPendientes").textContent = stats.materiasPendientes;
    document.getElementById("promedioGeneral").textContent    = stats.promedioGeneral;

    // Si no existe el chart, lo creo
    if (!dashboardChart) {
      const ctx = document.getElementById("dashboardChart").getContext("2d");
      dashboardChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Aprobadas", "Pendientes"],
          datasets: [{
            data: [stats.materiasAprobadas, stats.materiasPendientes],
            backgroundColor: ["#4caf50", "#f44336"]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
          cutout: "70%"
        }
      });
    } else {
      // si ya existe, solo actualizo datos y refresco
      dashboardChart.data.datasets[0].data = [
        stats.materiasAprobadas,
        stats.materiasPendientes
      ];
      dashboardChart.update();
    }
  } catch (err) {
    console.error("Error cargando estadísticas:", err);
  }
}

// 3) Al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  loadStats();  // primer render

  // 4) “En vivo” cada vez que cambias notas parciales
  const np1 = document.getElementById("notaParcial1");
  const np2 = document.getElementById("notaParcial2");
  if (np1 && np2) {
    np1.addEventListener("input", loadStats);
    np2.addEventListener("input", loadStats);
  }

  // 5) Y tras cada guardado de materia
  const origSave = saveMateria;
  saveMateria = async function() {
    await origSave();   // ejecuta tu lógica de guardar
    loadStats();        // luego refresca el dashboard
  };
});



function login() {
  const nombre   = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, password })
  })
    .then(res => res.json())
    .then(data => {
if (data.error) {
  Swal.fire({
    icon: 'error',
    title: 'Login fallido',
    text: data.error
  });
  return;
}

      // 1) Guardar token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      loggedUserId = data.user.id;

      // 2) Si es admin: redirigir inmediatamente a admin.html
      if (data.user.rol.toLowerCase() === "administrador") {
        window.location.href = "admin.html";
        return;
      }

      // 3) Si es alumno: ocultar modal y cargar su panel

      Toastify({
        text: `Bienvenid@, ${nombre}`,
        duration: 4000,
        gravity: "top",
        position: "right",
        backgroundColor: "#b78ef1",
        close: true,
      }).showToast();
// 3) si es alumno: recargo la misma página
  location.reload();


      const loginModal = document.getElementById("login-modal");
      if (loginModal) loginModal.style.display = "none";

      populateMateriasSelect();
      populateModalidadesSelect();
      loadMaterias();
    })
    .catch(err => console.error("Error en login:", err));
}


// ——— Cerrar sesión ———
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}
// ——— 5 · Funciones Materias + Eventos ———
// ——— Rellena el select de materias y asocia el listener ———
function populateMateriasSelect() {
  fetch("/db/materias/global", { headers: authHeaders() })
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById("NombreMateria");
      if (!select) return;

      // 1) Rellenar opciones
      select.innerHTML = `<option value="">-- Seleccione una Materia --</option>`;
      data.forEach(materia => {
        const option = document.createElement("option");
        option.value = materia.idMateria;
        option.text  = materia.NombreMateria;
        select.appendChild(option);
      });

      // 2) Asigno el listener aquí, justo después de poblar
      select.removeEventListener("change", _populateCorrelativas);  // por si ya existía
      select.addEventListener("change", _populateCorrelativas);
    })
    .catch(err => console.error("Error al cargar materias globales:", err));
}

// ——— Wrapper que llama a la función real y la loggea ———
function _populateCorrelativas(e) {
  const idMateria = e.target.value;
  console.log("▶ change detected, idMateria =", idMateria);
  populateCorrelativas(idMateria);
}

// ——— Trae y muestra las correlativas ———
function populateCorrelativas(idMateria) {
  const correlativasInput = document.getElementById("correlativas");
  if (!correlativasInput) return;

  // limpio si no hay selección
  if (!idMateria) {
    correlativasInput.value = "";
    return;
  }

  console.log("🔍 Fetch correlativas para materia:", idMateria);
  fetch(`/db/correlativas/${idMateria}`, { headers: authHeaders() })
    .then(res => {
      console.log("Response status correlativas:", res.status);
      return res.json();
    })
    .then(data => {
      console.log("📥 Datos correlativas recibidos:", data);
      const arr = Array.isArray(data) ? data : data ? [data] : [];
      correlativasInput.value = arr.map(m => m.NombreMateria).join(", ");
    })
    .catch(err => {
      console.error("Error al cargar correlativas:", err);
      correlativasInput.value = "";
    });
}


function populateModalidadesSelect() {
  fetch("/db/modalidades", { headers: authHeaders() })
    .then(r => r.json())
    .then(list => {
      const sel = document.getElementById("idModalidad");
      if (!sel) return;
      sel.innerHTML = '<option value="">-- Seleccione una Modalidad --</option>';
      list.forEach(m =>
        sel.insertAdjacentHTML(
          "beforeend",
          `<option value="${m.idModalidad}">${m.Nombre || m.tipoModalidad}</option>`
        )
      );
    })
    .catch(console.error);
}

/*function populateCorrelativas(idMateria) {
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
}*/


function loadMaterias() {
  if (!loggedUserId) return;

  fetch(`/db/materias?idUsuario=${loggedUserId}`, {
    headers: authHeaders()
  })
    .then(res => res.json())
    .then(data => renderMaterias(data))
    .catch(err => console.error("Error al cargar tus inscripciones:", err));
}


function renderMaterias(rows = []) {
  const table = document.getElementById("materiasTable");
  let tbody = table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }
  tbody.innerHTML = "";
  rows.forEach(({ idMateriaUsuario, materia, eventos }) => {
    const ev = eventos?.[0] || {};
    tbody.insertAdjacentHTML(
      "beforeend",
      `<tr>
        <td>${materia?.NombreMateria || "N/A"}</td>
        <td>${ev.anioDeCarrera || ""}</td>
        <td>${ev.anio || ""}</td>
        <td>${ev.horaInicio || ""}<br>${ev.horaFin || ""}</td>
        <td>${ev.modalidad?.Nombre || ev.modalidad?.tipoModalidad || ""}</td>
        <td>${ev.correlativas || ""}</td>
        <td>${ev.fechaExamen || ""}</td>
        <td>P1:${ev.notaParcial1 ?? "N/A"},P2:${ev.notaParcial2 ?? "N/A"},F:${ev.notaFinal ?? "N/A"}</td>
        <td>
          <button class="btn btn-info" onclick="showDetails(${idMateriaUsuario})">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-warning" onclick="editMateria(${idMateriaUsuario})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-danger" onclick="deleteMateria(${idMateriaUsuario})">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>`
    );
  });
}

function openFormModal() {
  populateMateriasSelect();
  populateModalidadesSelect();
  const fm = document.getElementById("form-modal");
  if (fm) fm.style.display = "flex";
}

function closeFormModal() {
  const fm = document.getElementById("form-modal");
  if (fm) fm.style.display = "none";
  clearForm();
  editingInscripcionId = null;
}

function clearForm() {
  const nm = document.getElementById("NombreMateria");
  if (nm) nm.selectedIndex = 0;
  const md = document.getElementById("idModalidad");
  if (md) md.selectedIndex = 0;
  const cr = document.getElementById("correlativas");
  if (cr) cr.value = "";
  const ec = document.getElementById("eventos-container");
  if (ec) ec.innerHTML = "<h3>Eventos</h3>";
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

  const url    = editingInscripcionId
               ? `/db/materia/${editingInscripcionId}`
               : "/db/materia";
  const method = editingInscripcionId ? "PUT" : "POST";

  fetch(url, {
    method,
    headers: authHeaders(),
    body: JSON.stringify(materiaData)
  })
    .then(r => {
      if (!r.ok) throw new Error("No autorizado");
      return r.json();
    })
    .then(() => {
      loadMaterias();
      loadStats(); 
      closeFormModal();
      editingInscripcionId = null;
    })
    .catch(err => console.error("Error al guardar materia:", err));
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
            loadStats();
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
      headers: authHeaders()  // Para pasar el middleware de admin en pruebas
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
      headers: { headers: authHeaders() }
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
      headers: { headers: authHeaders() }
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
   Función de notificaciones
============================ */


/**
 * Muestra dentro de #notificationsList los eventos recibidos
 * @param {Array} eventos — arreglo de objetos { tipo, fechaEntrega, fechaExamen, dia … }
 */
/*function mostrarEventosEnNotificaciones(eventos) {
  const panel = document.getElementById('notificationsList');
  if (!panel) return console.error('No existe #notificationsList');

  // Limpio contenido previo
  panel.innerHTML = '';

  if (!Array.isArray(eventos) || eventos.length === 0) {
    panel.innerHTML = '<p>No hay eventos próximos.</p>';
    return;
  }

  // Creo una lista de notificaciones
  const ul = document.createElement('ul');
  ul.style.listStyle = 'none';
  ul.style.padding = '0';

  eventos.forEach(ev => {
    const li = document.createElement('li');
    li.style.marginBottom = '0.5em';

    // Ejemplo de líneas que podés ajustar
    const fecha = ev.fechaEntrega || ev.fechaExamen || 'Fecha desconocida';
    li.innerHTML = `
      <strong>${ev.tipo}</strong><br>
      <small>${fecha} · Día: ${ev.dia || '–'}</small>
    `;
    ul.appendChild(li);
  });

  panel.appendChild(ul);
}*/


async function obtenerProximosEventos() {
  const res = await fetch("/notificaciones", {
    headers: authHeaders()
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}




function mostrarEventosEnNotificacionesEnPopup(eventos) {
  // Abre una “ventana” de 500×600
  const popup = window.open(
    "", 
    "Eventos Próximos", 
    "width=500,height=600,top=100,left=100"
  );
  if (!popup) return alert("Permite los pop-ups para esta web");

  // Cabecera HTML
  popup.document.write(`
    <html><head>
      <title>Próximos Eventos</title>
      <style>
        body { font-family: sans-serif; padding: 1em; }
        li { margin-bottom: .5em; }
      </style>
    </head><body>
      <h1>📅 Próximos Eventos</h1>
      <ul>
  `);

  // Lista
  eventos.forEach(ev => {
    const fecha = ev.fechaEntrega || ev.fechaExamen || "—";
    popup.document.write(`
      <li>
        <strong>${ev.tipo}</strong><br>
        Día: ${ev.dia || "—"} – Fecha: ${fecha}
      </li>
    `);
  });

  popup.document.write(`
      </ul>
      <button onclick="window.close()">Cerrar</button>
    </body></html>
  `);
}





/* ============================
   Función de reporte
============================ */


document.getElementById("btnImprimir").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Reporte de Materias y Eventos", 15, 20);

  // Datos de la grilla
  const headers = ["Materia", "Año", "Modalidad", "Eventos"];
  const rows = [];

  document.querySelectorAll("#materiasTable tbody tr").forEach(tr => {
    const cells = tr.querySelectorAll("td");
    const eventos = cells[6]?.textContent || "Sin eventos"; 
    rows.push([
      cells[0]?.textContent || "N/A",  // Materia
      cells[1]?.textContent || "",     // Año
      cells[4]?.textContent || "",     // Modalidad
      eventos                           // Eventos
    ]);
  });

  // Generar tabla
  doc.autoTable({
    startY: 30,
    head: [headers],
    body: rows,
    theme: "grid",
    styles: { fontSize: 12 }
  });

  // Descargar el PDF
  doc.save("reporte-materias.pdf");
});



