// Cargar lista de usuarios
function cargarUsuarios() {
  const tbody = document.getElementById("tablaUsuarios").querySelector("tbody");

  fetch("/db/usuarios", { headers: { "x-admin": "true" } })
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
        console.error("Respuesta inesperada:", data);
      }
    })
    .catch(err => console.error("Error al cargar usuarios:", err));
}

// Guardar nuevo usuario
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
      "x-admin": "true"
    },
    body: JSON.stringify({ nombre, password, rol })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert("Error: " + data.error);
      } else {
        alert("Usuario creado exitosamente.");
        cargarUsuarios(); // Recargar la lista
        document.getElementById("formUsuario").reset();
      }
    })
    .catch(err => console.error("Error al guardar usuario:", err));
}

// Editar usuario (cargar datos en el modal)
function editarUsuario(id) {
  fetch(`/db/usuarios/${id}`, { headers: { "x-admin": "true" } })
    .then(res => res.json())
    .then(usuario => {
      document.getElementById("editNombreUsuario").value = usuario.nombre;
      document.getElementById("editRolUsuario").value = usuario.rol;
      document.getElementById("editPasswordUsuario").value = ""; // Campo vacío por seguridad
      
      document.getElementById("modalEditarUsuario").setAttribute("data-user-id", id);
      
      abrirModalEditarUsuario();
    })
    .catch(err => console.error("Error al cargar usuario:", err));
}

// Guardar edición del usuario
function guardarEdicionUsuario() {
  const id = document.getElementById("modalEditarUsuario").getAttribute("data-user-id");
  const nombre = document.getElementById("editNombreUsuario").value;
  const rol = document.getElementById("editRolUsuario").value;
  const password = document.getElementById("editPasswordUsuario").value;

  if (!nombre || !rol) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  const datosUsuario = { nombre, rol };
  if (password) {
    datosUsuario.password = password; // Solo envía la nueva contraseña si se ingresó
  }

  fetch(`/db/usuarios/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json", 
      "x-admin": "true"
    },
    body: JSON.stringify(datosUsuario)
  })
    .then(res => res.json())
    .then(data => {
      alert("Usuario actualizado correctamente.");
      cerrarModalEditarUsuario();
      cargarUsuarios(); // Recargar la lista de usuarios
    })
    .catch(err => console.error("Error al actualizar usuario:", err));
}

// Eliminar usuario
function eliminarUsuario(id) {
  if (confirm("¿Está seguro de eliminar este usuario?")) {
    fetch(`/db/usuarios/${id}`, {
      method: "DELETE",
      headers: { "x-admin": "true" }
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || "Usuario eliminado.");
        cargarUsuarios();
      })
      .catch(err => console.error("Error al eliminar usuario:", err));
  }
}

// Mostrar el modal de edición
function abrirModalEditarUsuario() {
  document.getElementById("modalEditarUsuario").classList.add("active");
  document.getElementById("modalBackdrop").classList.add("active");
}

// Cerrar el modal de edición (solución al problema de cierre)
function cerrarModalEditarUsuario() {
  const modal = document.getElementById("modalEditarUsuario");
  const backdrop = document.getElementById("modalBackdrop");

  modal.classList.remove("active");
  backdrop.classList.remove("active");

  setTimeout(() => {
    modal.style.display = "none";
    backdrop.style.display = "none";
  }, 300); // Espera 300ms para efectos visuales
}

// Al cargar la página, invoca la lista de usuarios
window.onload = cargarUsuarios;
