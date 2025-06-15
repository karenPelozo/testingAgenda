/***********************************************
 *         scriptAdmin.js – Admin Panel        *
 ***********************************************/

// ——— 1 · Helper para JWT ———
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

// ——— 2 · DOMContentLoaded ———
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    // Si no hay sesión activa, vuelvo al login
    window.location.href = "index.html";
    return;
  }
  // Cargo tablas
  cargarUsuarios();
  cargarMateriasAdmin();
});

// ——— 3 · CRUD USUARIOS ———

// 3.1 Listar usuarios (GET /db/usuarios)
function cargarUsuarios() {
  const tbody = document.querySelector("#tablaUsuarios tbody");
  fetch("/db/usuarios", { headers: authHeaders() })
    .then(res => {
      if (!res.ok) throw new Error("Token inválido o no eres admin");
      return res.json();
    })
    .then(data => {
      tbody.innerHTML = "";
      data.forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${u.id}</td>
          <td>${u.nombre}</td>
          <td>${u.rol}</td>
          <td>
            <button class="btn btn-warning" onclick="editarUsuario(${u.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-danger" onclick="eliminarUsuario(${u.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>`;
        tbody.appendChild(tr);
      });
    })
    .catch(err => alert("Error al cargar usuarios: " + err.message));
}

// 3.2 Crear usuario (POST /db/usuarios)
function guardarUsuario() {
  const nombre   = document.getElementById("nombreUsuario").value.trim();
  const password = document.getElementById("passwordUsuario").value;
  const rol      = document.getElementById("rolUsuario").value;
  if (!nombre || !password || !rol) {
    return alert("Complete todos los campos.");
  }

  fetch("/db/usuarios", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ nombre, password, rol })
  })
    .then(res => {
      if (!res.ok) return res.json().then(e => { throw new Error(e.error); });
      return res.json();
    })
    .then(() => {
      Swal.fire({
  icon: "success",
  title: "¡Listo!",
  text: "Usuario creado correctamente",
  timer: 2000,
  showConfirmButton: false
});
      document.getElementById("formUsuario").reset();
      cargarUsuarios();
    })
    .catch(err => alert("Error al crear usuario: " + err.message));
}

// 3.3 Cargar usuario en modal (GET /db/usuarios/:id)
function editarUsuario(id) {
  fetch(`/db/usuarios/${id}`, { headers: authHeaders() })
    .then(res => {
      if (!res.ok) throw new Error("No autorizado");
      return res.json();
    })
    .then(u => {
      document.getElementById("editNombreUsuario") .value = u.nombre;
      document.getElementById("editRolUsuario")    .value = u.rol;
      document.getElementById("editPasswordUsuario").value = "";
      document.getElementById("modalEditarUsuario")
              .setAttribute("data-user-id", id);
      abrirModalEditarUsuario();
    })
    .catch(err => alert("Error al cargar usuario: " + err.message));
}

// 3.4 Guardar edición (PUT /db/usuarios/:id)
function guardarEdicionUsuario() {
  const modal = document.getElementById("modalEditarUsuario");
  const id    = modal.getAttribute("data-user-id");
  const nombre = document.getElementById("editNombreUsuario").value.trim();
  const rol    = document.getElementById("editRolUsuario").value;
  const pass   = document.getElementById("editPasswordUsuario").value;

  if (!nombre || !rol) {
    return alert("Nombre y rol son obligatorios.");
  }

  const body = { nombre, rol };
  if (pass) body.password = pass;

  fetch(`/db/usuarios/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body)
  })
    .then(res => res.json())
    .then(() => {
      alert("Usuario actualizado");
      cerrarModalEditarUsuario();
      cargarUsuarios();
    })
    .catch(err => alert("Error al actualizar usuario: " + err.message));
}

// 3.5 Eliminar usuario (DELETE /db/usuarios/:id) con SweetAlert2
function eliminarUsuario(id) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (!result.isConfirmed) return;

    // Si confirma, guardo
    fetch(`/db/usuarios/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudo eliminar');
        return res.json();
      })
      .then(() => {
        // Notificación de éxito
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El usuario fue eliminado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
        cargarUsuarios();
      })
      .catch(err => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el usuario',
        });
        console.error(err);
      });
  });
}

// Modal usuarios
function abrirModalEditarUsuario() {
  document.getElementById("modalEditarUsuario").classList.add("active");
  document.getElementById("modalBackdrop")      .classList.add("active");
}
function cerrarModalEditarUsuario() {
  const m = document.getElementById("modalEditarUsuario"),
        b = document.getElementById("modalBackdrop");
  m.classList.remove("active");
  b.classList.remove("active");
  setTimeout(() => { m.style.display = b.style.display = "none"; }, 300);
}

// ——— 4 · CRUD MATERIAS GLOBALES (admin) ———

// 4.1 Listar materias
function cargarMateriasAdmin() {
  const tbody = document.querySelector("#tablaMaterias tbody");
  fetch("/db/materias/global?includeAll=true", { headers: authHeaders() })
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = "";
      data.forEach(m => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${m.idMateria}</td>
          <td>${m.NombreMateria}</td>
          <td>${m.estado}</td>
          <td>
            <button id="switch" onclick="toggleEstadoMateria(${m.idMateria}, '${m.estado}')"
                    class="btn btn-sm ${m.estado==='Vigente'?'btn-warning':'btn-success'}">
              <i class="bi ${m.estado==='Vigente'?'bi-toggle-off':'bi-toggle-on'}"></i>
              ${m.estado==='Vigente'?'Dar baja':'Reactivar'}
            </button>
          </td>`;
        tbody.appendChild(tr);
      });
    })
    .catch(err => alert("Error al cargar materias: " + err.message));
}

// 4.2 Crear materia
function guardarMateria() {
  const nombre = document.getElementById("nombreMateria").value.trim();
  if (!nombre) return alert("Ingrese nombre de materia");
  fetch("/db/materia/global", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ NombreMateria: nombre })
  })
    .then(res => res.json())
    .then(() => {
      document.getElementById("formMateria").reset();
      cargarMateriasAdmin();
    })
    .catch(err => alert("Error al crear materia: " + err.message));
}

// 4.3 Cambiar estado
function toggleEstadoMateria(id, actual) {
  const nuevo = actual === "Vigente" ? "No Vigente" : "Vigente";
  fetch(`/db/materia/global/${id}/estado`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ estado: nuevo })
  })
    .then(res => res.json())
    .then(() => cargarMateriasAdmin())
    .catch(err => alert("Error al cambiar estado: " + err.message));
}

// ——— 5 · Logout ———
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
}
