import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// lista de colores hexadecimales para los cuadros
const colores: string[] = ['#ff1900', '#0099ff', '#00a444'];

// Variable global para la cantidad de cuadros
const CANTIDAD_CUADROS = 3;

const App: React.FC = () => {
    // Estado para saber si cada cuadro está detenido
    const [cuadrosDetenidos, setCuadrosDetenidos] = useState<boolean[]>(Array(CANTIDAD_CUADROS).fill(false));
    // Estado para los colores actuales de los cuadros
    const [coloresActuales, setColoresActuales] = useState<string[]>(
        Array.from({ length: CANTIDAD_CUADROS }, () => colores[Math.floor(Math.random() * colores.length)] as string)
    );
    // Estado para el mensaje de resultado (ganaste/perdiste)
    const [resultado, setResultado] = useState<string>('');
    // Referencia para los intervalos de cada cuadro
    const intervalos = useRef<Array<number | null>>(Array(CANTIDAD_CUADROS).fill(null));

    useEffect(() => {
        intervalos.current.forEach(id => id && clearInterval(id));
        intervalos.current = Array(CANTIDAD_CUADROS).fill(null);
        coloresActuales.forEach((_, indice) => {
            if (!cuadrosDetenidos[indice]) {
                intervalos.current[indice] = setInterval(() => {
                    setColoresActuales((prev) => {
                        if (cuadrosDetenidos[indice]) return prev;
                        let color: string;
                        do {
                            color = colores[Math.floor(Math.random() * colores.length)] as string;
                        } while (color === prev[indice]);
                        const copia = [...prev];
                        copia[indice] = color;
                        return copia;
                    });
                }, 1000);
            }
        });
        return () => {
            intervalos.current.forEach(id => id && clearInterval(id));
            intervalos.current = Array(CANTIDAD_CUADROS).fill(null);
        };
        // eslint-disable-next-line
    }, [cuadrosDetenidos]);

    const reiniciar = () => {
        const nuevosColores: string[] = Array.from({ length: CANTIDAD_CUADROS }, () => colores[Math.floor(Math.random() * colores.length)] as string);
        setCuadrosDetenidos(Array(CANTIDAD_CUADROS).fill(false));
        setColoresActuales(nuevosColores);
        setResultado('');
    };

    const detenerCambioColor = (indice: number) => {
        setCuadrosDetenidos((prev) => {
            const copia = [...prev];
            copia[indice] = true;
            return copia;
        });
        clearInterval(intervalos.current[indice]!);
        intervalos.current[indice] = null;
        const nuevosDetenidos = cuadrosDetenidos.map((d, i) => (i === indice ? true : d));
        const coloresDetenidos = coloresActuales.filter((_, i) => nuevosDetenidos[i]);
        if (nuevosDetenidos.filter(Boolean).length === 2) {
            if (coloresDetenidos.length === 2 && coloresDetenidos[0] !== coloresDetenidos[1]) {
                setResultado('¡Perdiste!');
                intervalos.current.forEach(id => id && clearInterval(id));
            }
        }
        if (nuevosDetenidos.filter(Boolean).length === CANTIDAD_CUADROS) {
            const todosIguales = coloresActuales.every((c) => c === coloresActuales[0]);
            if (todosIguales) {
                setResultado('¡Ganaste!');
            } else {
                setResultado('¡Perdiste!');
            }
            intervalos.current.forEach(id => id && clearInterval(id));
        }
    };

    return (
        <div className="App">
            <div className="contenedor-juego">
                {coloresActuales.map((color, indice) => (
                    <div key={indice} className="cuadro">
                        <div className="color" style={{ backgroundColor: color }}></div>
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '24px' }}>
                <div className={`resultado${resultado === '¡Ganaste!' ? ' ganaste' : resultado === '¡Perdiste!' ? ' perdiste' : ''}`}>{resultado}</div>
                <button id="btn-reiniciar" onClick={reiniciar} style={{ marginTop: '20px' }}>Reiniciar</button>
            </div>
        </div>
    );
};

export default App;
