   // Función para cargar la lista de usuarios
    function cargarUsuarios() {
      const tbody = document.getElementById("tablaUsuarios").querySelector("tbody");
      fetch("/db/usuarios", {
        headers: { "x-admin": "true" } // Solo para pruebas, para que el middleware de admin lo acepte
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
            console.error("Respuesta inesperada:", data);
          }
        })
        .catch(err => console.error("Error al cargar usuarios:", err));
    }
    
    // Función para guardar un nuevo usuario
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
          "x-admin": "true"  // Header para pasar autenticación (temporal para pruebas)
        },
        body: JSON.stringify({ nombre, password, rol })
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            alert("Error: " + data.error);
          } else {
            alert("Usuario creado exitosamente");
            cargarUsuarios(); // Recarga la lista
            document.getElementById("formUsuario").reset();
          }
        })
        .catch(err => console.error("Error al guardar usuario:", err));
    }
    
    // Función básica para editar usuario (se puede expandir con un modal de edición)
    function editarUsuario(id) {
      alert("Función editar usuario con ID: " + id);
      // Podrías redirigir o abrir un modal pasando los datos actuales para editar
    }
    
    // Función para eliminar usuario
    function eliminarUsuario(id) {
      if (confirm("¿Está seguro de eliminar este usuario?")) {
        fetch(`/db/usuarios/${id}`, {
          method: "DELETE",
          headers: { "x-admin": "true" }  // Header para pasar autenticación
        })
          .then(res => res.json())
          .then(data => {
            alert(data.message || "Usuario eliminado");
            cargarUsuarios();
          })
          .catch(err => console.error("Error al eliminar usuario:", err));
      }
    }
    
    // Al cargar la página, se invoca cargarUsuarios() para llenar la tabla
    window.onload = () => {
      // Opcionalmente se podría verificar que se tenga sesión de admin, o ya haber pasado por login.
      cargarUsuarios();
    }