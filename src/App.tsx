// Importo React y hooks necesarios
import React, { useState, useEffect, useRef } from 'react';
// Importo los estilos globales
import './App.css';

// Lista de colores hexadecimales para los cuadros (puedes agregar o quitar colores y el juego se adapta)
const colores: string[] = ['#ff1900', '#0099ff', '#00a444'];


// Componente principal del juego
const App: React.FC = () => {
    // Estado para saber si cada cuadro está detenido (true/false por cada cuadro)
    const [cuadrosDetenidos, setCuadrosDetenidos] = useState<boolean[]>(Array(colores.length).fill(false));

    // Estado para los colores actuales de los cuadros (un color por cada cuadro)
    const [coloresActuales, setColoresActuales] = useState<string[]>(
        Array.from({ length: colores.length }, () => colores[Math.floor(Math.random() * colores.length)] as string)
    );

    // Sincronizar los estados si cambia la cantidad de colores (por ejemplo, si agregas/quitas colores)
    React.useEffect(() => {
        setCuadrosDetenidos(Array(colores.length).fill(false));
        setColoresActuales(Array.from({ length: colores.length }, () => colores[Math.floor(Math.random() * colores.length)] as string));
        intervalos.current = Array(colores.length).fill(null); // reinicio los intervalos
    }, [colores.length]);

    // Estado para el mensaje de resultado (ganaste/perdiste)
    const [resultado, setResultado] = useState<string>('');

    // Referencia para los intervalos de cada cuadro (para poder detenerlos individualmente)
    const intervalos = useRef<Array<number | null>>(Array(colores.length).fill(null));

    // Efecto para manejar el cambio automático de color de los cuadros
    useEffect(() => {
        // Limpio todos los intervalos anteriores
        intervalos.current.forEach(id => id && clearInterval(id));
        intervalos.current = Array(colores.length).fill(null);

        // Para cada cuadro, si no está detenido, le asigno un intervalo para que cambie de color cada segundo
        coloresActuales.forEach((_, indice) => {
            if (!cuadrosDetenidos[indice]) {
                intervalos.current[indice] = setInterval(() => {
                    setColoresActuales((prev) => {
                        if (cuadrosDetenidos[indice]) return prev; // si el cuadro está detenido, no cambia
                        let color: string;
                        do {
                            color = colores[Math.floor(Math.random() * colores.length)] as string;
                        } while (color === prev[indice]); // aseguro que no repita el color anterior
                        const copia = [...prev];
                        copia[indice] = color;
                        return copia;
                    });
                }, 1000);
            }
        });

        // Limpio los intervalos al desmontar o actualizar
        return () => {
            intervalos.current.forEach(id => id && clearInterval(id));
            intervalos.current = Array(colores.length).fill(null);
        };
        // eslint-disable-next-line
    }, [cuadrosDetenidos, colores.length]);

    // Función para reiniciar el juego (colores y cuadros vuelven a su estado inicial)
    const reiniciar = () => {
        const nuevosColores: string[] = Array.from({ length: colores.length }, () => colores[Math.floor(Math.random() * colores.length)] as string);
        setCuadrosDetenidos(Array(colores.length).fill(false));
        setColoresActuales(nuevosColores);
        setResultado('');
    };

    // Función para detener el cambio de color de un cuadro específico
    const detenerCambioColor = (indice: number) => {
        // Marco el cuadro como detenido
        setCuadrosDetenidos((prev) => {
            const copia = [...prev];
            copia[indice] = true;
            return copia;
        });
        // Limpio el intervalo de ese cuadro
        clearInterval(intervalos.current[indice]!);
        intervalos.current[indice] = null;

        // Verifico el estado del juego para ver si ya ganó o perdió
        const nuevosDetenidos = cuadrosDetenidos.map((d, i) => (i === indice ? true : d));
        const coloresDetenidos = coloresActuales.filter((_, i) => nuevosDetenidos[i]);

        // Si hay dos cuadros detenidos y son de diferente color, perdió
        if (nuevosDetenidos.filter(Boolean).length === 2) {
            if (coloresDetenidos.length === 2 && coloresDetenidos[0] !== coloresDetenidos[1]) {
                setResultado('¡Perdiste!');
                intervalos.current.forEach(id => id && clearInterval(id));
            }
        }
        // Si todos los cuadros están detenidos
        if (nuevosDetenidos.filter(Boolean).length === colores.length) {
            const todosIguales = coloresActuales.every((c) => c === coloresActuales[0]);
            if (todosIguales) {
                setResultado('¡Ganaste!');
            } else {
                setResultado('¡Perdiste!');
            }
            intervalos.current.forEach(id => id && clearInterval(id));
        }
    };

    // Renderizo la interfaz del juego
    return (
        <div className="App"> {/* Contenedor principal */}
            <div className="contenedor-juego"> {/* Contenedor de los cuadros */}
                {coloresActuales.map((color, indice) => (
                    <div key={indice} className="cuadro"> {/* Cada cuadro */}
                        <div className="color" style={{ backgroundColor: color }}></div> {/* Muestra el color */}
                        <button
                            className="btn-detener"
                            onClick={() => detenerCambioColor(indice)}
                            disabled={cuadrosDetenidos[indice] || !!resultado}
                            style={{ marginTop: '8px' }}>
                            Detener
                        </button>
                    </div>
                ))}
            </div>
            {/* Resultado y botón de reinicio */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '24px' }}>
                <div className={`resultado${resultado === '¡Ganaste!' ? ' ganaste' : resultado === '¡Perdiste!' ? ' perdiste' : ''}`}>{resultado}</div>
                <button id="btn-reiniciar" onClick={reiniciar} style={{ marginTop: '20px' }}>Reiniciar</button>
            </div>
        </div>
    );
};


export default App;