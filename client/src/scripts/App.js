// src/App.js
import React, { useState, useEffect } from "react";
import "../styles/App.css";//app.css

function App() {
  const [materias, setMaterias] = useState([]);
  const [form, setForm] = useState({ nombre: "", horario: "", examen: "" });
  
  // Cargar las materias desde el backend
  useEffect(() => {
    fetch("http://localhost:3000/materias")
      .then(response => response.json())
      .then(data => setMaterias(data))
      .catch(error => console.error("Error al cargar datos:", error));
  }, []);
  
  // Manejo de entrada en el formulario
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // Agregar una nueva materia
  const addMateria = () => {
    // Se construye el objeto según el JSON esperado. Se asignan valores por defecto a otros campos.
    const newMateria = {
      nombre: form.nombre,
      horario: form.horario,
      anioDeCarrera: 1, // valor predeterminado
      anio: new Date().getFullYear().toString(),
      modalidad: "Presencial",
      correlativas: [],
      notas: {},
      eventos: [
        {
          tipo: "Parcial",
          numero: 1,
          temasAEstudiar: "",
          estado: "Pendiente",
          fechaEntrega: form.examen
        }
      ]
    };
    
    fetch("http://localhost:3000/materias", {
      method: "POST",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify(newMateria)
    })
      .then(response => response.json())
      .then(data => {
        setMaterias([...materias, data]);
        setForm({ nombre: "", horario: "", examen: "" });
      })
      .catch(error => console.error("Error al agregar materia:", error));
  };

  // Eliminar una materia
  const deleteMateria = (id) => {
    fetch(`http://localhost:3000/materias/${id}`, {
      method: "DELETE"
    })
      .then(() => {
        setMaterias(materias.filter(materia => materia.id !== id));
      })
      .catch(error => console.error("Error al eliminar materia:", error));
  };

  // Extraer el día (la primera palabra) del horario
  const extractDia = (horario) => {
    return horario.split(" ")[0];
  };

  // Extraer la hora (lo que sigue después del día en el horario)
  const extractHora = (horario) => {
    return horario.substring(horario.indexOf(" ") + 1);
  };

  // Obtener la fecha del examen (primer evento de tipo "Parcial")
  const getExamenDate = (eventos) => {
    const examEvent = eventos.find(e => e.tipo === "Parcial");
    return examEvent ? examEvent.fechaEntrega : "N/A";
  };

  return (
    <div className="App">
      <h1>Agenda de Materias</h1>
      <div className="formulario">
        <input
          name="nombre"
          placeholder="Materia"
          value={form.nombre}
          onChange={handleInputChange}
        />
        <input
          name="horario"
          placeholder="Horario (ej: Lunes 08:00 - 12:00)"
          value={form.horario}
          onChange={handleInputChange}
        />
        <input
          name="examen"
          type="date"
          placeholder="Fecha de examen"
          value={form.examen}
          onChange={handleInputChange}
        />
        <button onClick={addMateria}>Nuevo</button>
      </div>
      
      {materias.length > 0 && (
        <table border="1" style={{ margin: "auto", marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Materia</th>
              <th>Día</th>
              <th>Hora</th>
              <th>Examen</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materias.map(materia => (
              <tr key={materia.id}>
                <td>{materia.nombre}</td>
                <td>{extractDia(materia.horario)}</td>
                <td>{extractHora(materia.horario)}</td>
                <td>{getExamenDate(materia.eventos)}</td>
                <td>
                  <button onClick={() => deleteMateria(materia.id)}>Eliminar</button>
                  {/* Aquí puedes implementar la funcionalidad para editar o modificar */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;