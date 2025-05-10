import { motion, AnimatePresence } from 'framer-motion'; // Importa AnimatePresence para manejar animaciones de entrada/salida
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import fishes from '@/data/fishes.json'; // Importa el JSON con los datos de los peces

const bottomRightToTopLeftVariants = {
    initial: { clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)' },
    animate: { clipPath: 'polygon(100% 100%, 0% 100%, 0% 0%, 100% 0%)' },
    exit: { clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)' },
};

// Variantes para la animación de cambio de pez
const fishVariants = {
    initial: { opacity: 0, x: 100 }, // Comienza transparente y desplazado a la derecha
    animate: { opacity: 1, x: 0 }, // Aparece y se centra
    exit: { opacity: 0, x: -100 }, // Desaparece desplazándose a la izquierda
};

export function Aquarium() {
    const navigate = useNavigate();
    const [currentFishIndex, setCurrentFishIndex] = useState(0); // Estado para el pez actual

    // Función para cambiar al pez anterior
    const handlePreviousFish = () => {
        setCurrentFishIndex((prevIndex) =>
            prevIndex === 0 ? fishes.length - 1 : prevIndex - 1
        );
    };

    // Función para cambiar al siguiente pez
    const handleNextFish = () => {
        setCurrentFishIndex((prevIndex) =>
            prevIndex === fishes.length - 1 ? 0 : prevIndex + 1
        );
    };

    // Datos del pez actual
    const currentFish = fishes[currentFishIndex];

    return (
        <motion.div
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
                        transition={{ duration: 0.5 }}
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

            {/* Flechas de navegación */}
            <motion.div
                className="absolute left-10 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={handlePreviousFish}
                whileHover={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 300 }}
            >
                <motion.img
                    src="/src/assets/icons/arrow-left.svg"
                    alt="Flecha izquierda"
                    className="w-12 h-12"
                    whileHover={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                />
                <motion.img
                    src="/src/assets/icons/arrow-left-hover.svg"
                    alt="Flecha izquierda hover"
                    className="w-12 h-12 absolute top-0 left-0"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                />
            </motion.div>

            <motion.div
                className="absolute right-10 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={handleNextFish}
                whileHover={{ scale: 1.2 }}
                transition={{ type: 'spring', stiffness: 300 }}
            >
                <motion.img
                    src="/src/assets/icons/arrow-right.svg"
                    alt="Flecha derecha"
                    className="w-12 h-12"
                    whileHover={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                />
                <motion.img
                    src="/src/assets/icons/arrow-right-hover.svg"
                    alt="Flecha derecha hover"
                    className="w-12 h-12 absolute top-0 left-0"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                />
            </motion.div>
        </motion.div>
    );
}