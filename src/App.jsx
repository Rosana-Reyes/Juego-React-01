import React, { useState, useEffect } from 'react';
import './App.css';

// lista de colores hexadecimales para los cuadros
const colores = ['#ff1900', '#0099ff', '#00a444'];

// Variable global para la cantidad de cuadros
const CANTIDAD_CUADROS = 3;

// Componente principal del juego
const App = () => {
  // Estado para saber si cada cuadro está detenido
  const [cuadrosDetenidos, setCuadrosDetenidos] = useState(Array(CANTIDAD_CUADROS).fill(false));
  // Estado para los colores actuales de los cuadros
  const [coloresActuales, setColoresActuales] = useState(
    Array.from({ length: CANTIDAD_CUADROS }, () => colores[Math.floor(Math.random() * colores.length)])
  );
  // Estado para el mensaje de resultado (ganaste/perdiste)
  const [resultado, setResultado] = useState('');
  // Referencia para los intervalos de cada cuadro
  const intervalos = React.useRef(Array(CANTIDAD_CUADROS).fill(null));

  // Este efecto es para el cambio de color de los cuadros, se ejecuta cada vez que cambia el estado de cuadrosDetenidos
  useEffect(() => {
    // Limpio los intervalos anteriores para que no se acumulen
    intervalos.current.forEach(id => clearInterval(id));
    intervalos.current = Array(CANTIDAD_CUADROS).fill(null);
    // Para cada cuadro, si no está detenido, le pongo un intervalo para que cambie de color.
    coloresActuales.forEach((_, indice) => {
      if (!cuadrosDetenidos[indice]) {
        intervalos.current[indice] = setInterval(() => {
          setColoresActuales((prev) => {
            if (cuadrosDetenidos[indice]) return prev;
            let color;
            do {
              color = colores[Math.floor(Math.random() * colores.length)];
            } while (color === prev[indice]);
            const copia = [...prev];
            copia[indice] = color;
            return copia;
          });
        }, 1000);
      }
    });
    // Cuando el componente se desmonta, limpio los intervalos 
    return () => {
      intervalos.current.forEach(id => clearInterval(id));
      intervalos.current = Array(CANTIDAD_CUADROS).fill(null);
    };
    // eslint-disable-next-line
  }, [cuadrosDetenidos]);

  // Función para reiniciar el juego
  const reiniciar = () => {
    // Elijo nuevos colores al azar para los cuadros
    const nuevosColores = Array.from({ length: CANTIDAD_CUADROS }, () => colores[Math.floor(Math.random() * colores.length)]);
    setCuadrosDetenidos(Array(CANTIDAD_CUADROS).fill(false));
    setColoresActuales(nuevosColores);
    setResultado('');
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
      if (coloresDetenidos.length === 2 && coloresDetenidos[0] !== coloresDetenidos[1]) {
        setResultado('¡Perdiste!');
        intervalos.current.forEach(id => clearInterval(id));
      }
    }
    // Si todos los cuadros están detenidos
    if (nuevosDetenidos.filter(Boolean).length === CANTIDAD_CUADROS) {
      const todosIguales = coloresActuales.every((c) => c === coloresActuales[0]);
      if (todosIguales) {
        setResultado('¡Ganaste!');
      } else {
        setResultado('¡Perdiste!');
      }
      intervalos.current.forEach(id => clearInterval(id));
    }
  };

  // Renderizo la interfaz del juego
  return (
    <div className="App"> {/* Aquí va todo el juego */}
      <div className="contenedor-juego"> {/* Aquí pongo los cuadros uno al lado del otro */}
        {coloresActuales.map((color, indice) => (
          <div key={indice} className="cuadro"> {/* Cada cuadro */}
            <div className="color" style={{ backgroundColor: color }}></div> {/* Aquí muestro el color */}
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