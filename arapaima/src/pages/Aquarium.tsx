import { motion, AnimatePresence } from 'framer-motion'; // Importa AnimatePresence para manejar animaciones de entrada/salida
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import fishes from '@/data/fishes.json'; // Importa el JSON con los datos de los peces

const bottomRightToTopLeftVariants = {
    initial: { clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)' },
    animate: { clipPath: 'polygon(100% 100%, 0% 100%, 0% 0%, 100% 0%)' },
    exit: { clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)' },
};

// Variantes para la animación de cambio de pez
const fishVariants = {
    initial: { opacity: 0, scale: 0.8, y: 100 }, // Comienza pequeño, transparente y desplazado hacia abajo
    animate: { opacity: 1, scale: 1, y: 0 }, // Aparece en su tamaño normal y posición
    exit: { opacity: 0, scale: 1.2, y: -100 }, // Desaparece creciendo ligeramente y desplazándose hacia arriba
};

export function Aquarium() {
    const navigate = useNavigate();
    const [currentFishIndex, setCurrentFishIndex] = useState(0); // Estado para el pez actual
    const containerRef = useRef<HTMLDivElement | null>(null); // Referencia al contenedor para manejar el scroll
    const scrollThreshold = 100; // Umbral de desplazamiento para cambiar de pez
    const scrollDelta = useRef(0); // Acumulador del desplazamiento

    // Función para cambiar al siguiente pez
    const handleNextFish = (): void => {
        setCurrentFishIndex((prevIndex) =>
            prevIndex === fishes.length - 1 ? 0 : prevIndex + 1
        );
    };

    // Función para cambiar al pez anterior
    const handlePreviousFish = (): void => {
        setCurrentFishIndex((prevIndex) =>
            prevIndex === 0 ? fishes.length - 1 : prevIndex - 1
        );
    };

    // Manejar el evento de scroll
    const handleScroll = (event: WheelEvent): void => {
        const { deltaY } = event; // Detecta la dirección del scroll
        scrollDelta.current += deltaY;

        if (scrollDelta.current > scrollThreshold) {
            handleNextFish(); // Scroll hacia abajo
            scrollDelta.current = 0; // Reinicia el acumulador
        } else if (scrollDelta.current < -scrollThreshold) {
            handlePreviousFish(); // Scroll hacia arriba
            scrollDelta.current = 0; // Reinicia el acumulador
        }
    };

    // Agregar el evento de scroll al contenedor
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleScroll);
            }
        };
    }, []);

    // Datos del pez actual
    const currentFish = fishes[currentFishIndex];

    return (
        <motion.div
            ref={containerRef} // Referencia al contenedor
            className="relative min-h-screen flex flex-col items-center justify-start text-white"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={bottomRightToTopLeftVariants}
            transition={{ duration: 0.5 }}
            style={{
                backgroundImage: "url('/src/assets/background/background-aquarium.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                userSelect: 'none',
            }}
        >
            {/* Contenedor para centrar el logo */}
            <div className="w-full flex justify-center items-center py-5">
                <div
                    className="cursor-pointer flex flex-col items-center"
                    onClick={() => navigate('/')}
                >
                    <img
                        src="/src/assets/logo/logo.svg"
                        alt="Logo"
                        className="w-80 h-auto"
                        style={{ userSelect: 'none' }}
                    />
                </div>
            </div>

            {/* Contenedor centralizado */}
            <div className="relative flex flex-col items-center justify-center text-center p-8 py-0 w-[60%]">
                <AnimatePresence mode="wait">
                    {/* Contenido del pez actual con animación */}
                    <motion.div
                        key={currentFishIndex} // Cambia la clave para que AnimatePresence detecte el cambio
                        variants={fishVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.8 }} // Animación más lenta para el efecto de profundidad
                        className="flex flex-col items-center"
                    >
                        {/* Nombre del pez */}
                        <h1 className="text-4xl font-bold mb-8">{currentFish.name}</h1>

                        {/* Datos del pez */}
                        <p className="text-lg mb-8">
                            <strong>Datos:</strong> {currentFish.data}
                        </p>

                        {/* Características del pez en formato horizontal */}
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            {Object.entries(currentFish.characteristics).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="bg-gray-800 bg-opacity-75 p-2 rounded-md shadow-md text-sm"
                                >
                                    <strong>{key}:</strong> {value}
                                </div>
                            ))}
                        </div>

                        {/* Imagen del pez */}
                        <img
                            src={currentFish.image}
                            alt={currentFish.name}
                            className="w-125 h-80 object-cover rounded-lg mt-8"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
}