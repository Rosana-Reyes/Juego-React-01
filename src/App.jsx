import React, { useState, useEffect } from 'react';
import './App.css';

// lista de colores para los cuadros
const colores = ['rojo', 'azul', 'verde'];

// Componente principal del juego
const App = () => {
  // Estado para saber si cada cuadro está detenido
  const [cuadrosDetenidos, setCuadrosDetenidos] = useState([false, false, false]);
  // Estado para los colores actuales de los cuadros
  const [coloresActuales, setColoresActuales] = useState([
    colores[Math.floor(Math.random() * colores.length)],
    colores[Math.floor(Math.random() * colores.length)],
    colores[Math.floor(Math.random() * colores.length)]
  ]);
  // Estado para el mensaje de resultado (ganaste/perdiste)
  const [resultado, setResultado] = useState('');
  // Referencia para los intervalos de cada cuadro
  const intervalos = React.useRef([null, null, null]);

  // Este efecto es para el cambio de color de los cuadros, se ejecuta cada vez que cambia el estado de cuadrosDetenidos
  useEffect(() => {
    // Limpio los intervalos anteriores para que no se acumulen
    intervalos.current.forEach(id => clearInterval(id));
    intervalos.current = [null, null, null];
    // Para cada cuadro, si no está detenido, le pongo un intervalo para que cambie de color.
    coloresActuales.forEach((_, indice) => {
      if (!cuadrosDetenidos[indice]) {
        intervalos.current[indice] = setInterval(() => {
          // Cambio el color del cuadro, pero nunca repito el mismo
          setColoresActuales((prev) => {
            console.log(`Cuadro ${indice + 1} cambió a:`, prev);
            if (cuadrosDetenidos[indice]) return prev; // Si está detenido, no hace nada
            let color;
            do {
              color = colores[Math.floor(Math.random() * colores.length)]; // Se elige un color al azar
            } while (color === prev[indice]); // Me aseguro que no sea igual al anterior
            const copia = [...prev];
            copia[indice] = color; // Actualizo el color
            return copia;
          });
        }, 1000); // Cada segundo cambia el color
      }
    });
    // Cuando el componente se desmonta, limpio los intervalos 
    return () => {
      intervalos.current.forEach(id => clearInterval(id));
      intervalos.current = [null, null, null];
    };
    // eslint-disable-next-line
  }, [cuadrosDetenidos]);

  // Función para reiniciar el juego
  const reiniciar = () => {
    // Elijo nuevos colores al azar para los cuadros
    const nuevosColores = [
      colores[Math.floor(Math.random() * colores.length)], // Color para el primero
      colores[Math.floor(Math.random() * colores.length)], // Color para el segundo
      colores[Math.floor(Math.random() * colores.length)]  // Color para el tercero 
    ];
    setCuadrosDetenidos([false, false, false]); // Todos los cuadros vuelven a estar en juego
    setColoresActuales(nuevosColores); // Actualizo los colores
    setResultado(''); // Borro el mensaje de resultado 
  };

  // Función para detener el cambio de color de un cuadro
  const detenerCambioColor = (indice) => {
    // Marco el cuadro como detenido
    setCuadrosDetenidos((prev) => {
      const copia = [...prev];
      copia[indice] = true; // Aquí detengo el cuadro
      return copia;
    });
    // Limpio el intervalo de ese cuadro
    clearInterval(intervalos.current[indice]);
    intervalos.current[indice] = null;

    // Verifico el estado del juego para ver si ya ganó o perdió
    const nuevosDetenidos = cuadrosDetenidos.map((d, i) => (i === indice ? true : d));
    const coloresDetenidos = coloresActuales.filter((_, i) => nuevosDetenidos[i]);

    // Si hay dos cuadros detenidos y son de diferente color, perdió
    if (nuevosDetenidos.filter(Boolean).length === 2) {
      if (coloresDetenidos[0] !== coloresDetenidos[1]) {
        setResultado('¡Perdiste!'); // Aquí muestro que perdió
        intervalos.current.forEach(id => clearInterval(id)); // Detengo todos los intervalos
      }
    }
    // Si los tres cuadros están detenidos  
    if (nuevosDetenidos.filter(Boolean).length === 3) {
      if (
        coloresActuales[0] === coloresActuales[1] &&
        coloresActuales[1] === coloresActuales[2]
      ) {
        setResultado('¡Ganaste!'); // Aquí muestro que ganó
      } else {
        setResultado('¡Perdiste!'); // Aquí muestro que perdió
      }
      intervalos.current.forEach(id => clearInterval(id)); // Detengo todos los intervalos
    }
  };

  // Renderizo la interfaz del juego
  return (
    <div className="App"> {/* Aquí va todo el juego */}
      <div className="contenedor-juego"> {/* Aquí pongo los cuadros uno al lado del otro */}
        {coloresActuales.map((color, indice) => (
          <div key={indice} className="cuadro"> {/* Cada cuadro */}
            <div className={`color ${color}`}></div> {/* Aquí muestro el color */}
            {/* Botón para detener el cuadro */}
            <button
              className="btn-detener"
              onClick={() => detenerCambioColor(indice)}
              disabled={cuadrosDetenidos[indice] || resultado}
              style={{ marginTop: '8px' }}>
              Detener
            </button>
          </div>
        ))}
      </div>
      {/* Aquí muestro el resultado y el botón de reiniciar, ambos centrados */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '24px' }}>
        <div className={`resultado${resultado === '¡Ganaste!' ? ' ganaste' : resultado === '¡Perdiste!' ? ' perdiste' : ''}`}>{resultado}</div> {/* Aquí sale si ganó o perdió */}
        <button id="btn-reiniciar" onClick={reiniciar} style={{ marginTop: '20px' }}>Reiniciar</button> {/* Botón para reiniciar el juego */}
      </div>
    </div>
  );
};

export default App;