import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import libraryData from '@/data/library.json'; // Importamos los datos de los libros

const leftBottomToTopRightVariants = {
    initial: { clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)' },
    animate: { clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)' },
    exit: { clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)' },
};

export function Library() {
    const navigate = useNavigate();
    const [centerBook, setCenterBook] = useState(libraryData[0]); // Estado para el libro en el enmascarador superior
    const bottomCenterBook = libraryData[0]; // Libro central inferior fijo

    // Dividimos los libros en tres secciones
    const leftBooks = libraryData.slice(1, 5); // Libros para el contenedor izquierdo
    const rightBooks = libraryData.slice(5, 9); // Libros para el contenedor derecho

    return (
        <motion.div
            className="relative min-h-screen flex flex-col items-center justify-start text-white"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={leftBottomToTopRightVariants}
            transition={{ duration: 0.5 }}
            style={{
                backgroundImage: "url('/src/assets/background/background-library.png')",
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
                        className="w-72 h-auto"
                        style={{ userSelect: 'none' }}
                    />
                </div>
            </div>

            {/* Máscara superior central con sinopsis */}
            <div className="flex items-center justify-center gap-4 my-4">
                {/* Máscara superior central */}
                <motion.div
                    className="relative w-[250px] h-[350px]" // Reducimos el tamaño
                    layout
                    initial={{ x: 0, rotate: 0 }} // Empieza en el centro sin rotación
                    animate={{ x: -100, rotate: -10 }} // Se mueve hacia la izquierda y rota
                    transition={{ duration: 0.5 }} // Duración de la animación
                    key={centerBook.title} // Reactivamos la animación al cambiar el libro
                >
                    <svg className="w-full h-full">
                        <defs>
                            <mask id="mask-library">
                                <image
                                    href="/src/assets/icons/mask-library.svg"
                                    width="100%"
                                    height="100%"
                                    preserveAspectRatio="xMidYMid meet"
                                />
                            </mask>
                        </defs>
                        <image
                            href={centerBook.images[0]} // Imagen del libro central superior
                            width="100%"
                            height="100%"
                            preserveAspectRatio="xMidYMid slice"
                            mask="url(#mask-library)"
                        />
                    </svg>
                </motion.div>

                {/* Contenedor de la sinopsis */}
                <div className="w-[250px] text-left"> {/* Reducimos el ancho */}
                    <h2 className="text-xl font-bold mb-2">{centerBook.title}</h2> {/* Reducimos el tamaño del texto */}
                    <p className="text-base leading-relaxed mb-2">
                        {centerBook.content || 'Sinopsis no disponible.'}
                    </p>
                    <a
                        href={centerBook.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline text-sm" // Reducimos el tamaño del enlace
                    >
                        {centerBook.url}
                    </a>
                </div>
            </div>

            {/* Contenedor principal para la librería */}
            <div className="flex items-center justify-center gap-12"> {/* Aumentamos el espacio entre los contenedores */}
                {/* Contenedor izquierdo */}
                <div className="grid grid-cols-2 gap-6"> {/* Aumentamos el espacio entre libros */}
                    {leftBooks.map((book, index) => (
                        <motion.div
                            key={index}
                            className="relative w-[150px] h-[180px] cursor-pointer hover:scale-105 transition-transform" // Hacemos los libros más anchos
                            onClick={() => setCenterBook(book)} // Actualizar el libro central superior
                        >
                            <svg className="w-full h-full">
                                <defs>
                                    <mask id={`mask-left-${index}`}>
                                        <image
                                            href="/src/assets/icons/library-left.svg"
                                            width="100%"
                                            height="100%"
                                            preserveAspectRatio="xMidYMid meet"
                                        />
                                    </mask>
                                </defs>
                                <image
                                    href={book.images[0]} // Imagen del libro
                                    width="100%"
                                    height="100%"
                                    preserveAspectRatio="xMidYMid slice"
                                    mask={`url(#mask-left-${index})`}
                                />
                            </svg>
                        </motion.div>
                    ))}
                </div>

                {/* Elemento central inferior */}
                <div
                    className="relative w-[250px] h-[400px] cursor-pointer hover:scale-105 transition-transform" // Hacemos el libro central inferior más ancho
                    onClick={() => setCenterBook(bottomCenterBook)} // Actualizar el libro central superior al hacer clic
                >
                    <svg className="w-full h-full">
                        <defs>
                            <mask id="mask-center">
                                <image
                                    href="/src/assets/icons/library-center.svg"
                                    width="100%"
                                    height="100%"
                                    preserveAspectRatio="xMidYMid meet"
                                />
                            </mask>
                        </defs>
                        <image
                            href={bottomCenterBook.images[0]} // Imagen del libro central inferior
                            width="100%"
                            height="100%"
                            preserveAspectRatio="xMidYMid slice"
                            mask="url(#mask-center)"
                        />
                    </svg>
                </div>

                {/* Contenedor derecho */}
                <div className="grid grid-cols-2 gap-6"> {/* Aumentamos el espacio entre libros */}
                    {rightBooks.map((book, index) => (
                        <motion.div
                            key={index}
                            className="relative w-[150px] h-[180px] cursor-pointer hover:scale-105 transition-transform" // Hacemos los libros más anchos
                            onClick={() => setCenterBook(book)} // Actualizar el libro central superior
                        >
                            <svg className="w-full h-full">
                                <defs>
                                    <mask id={`mask-right-${index}`}>
                                        <image
                                            href="/src/assets/icons/library-right.svg"
                                            width="100%"
                                            height="100%"
                                            preserveAspectRatio="xMidYMid meet"
                                        />
                                    </mask>
                                </defs>
                                <image
                                    href={book.images[0]} // Imagen del libro
                                    width="100%"
                                    height="100%"
                                    preserveAspectRatio="xMidYMid slice"
                                    mask={`url(#mask-right-${index})`}
                                />
                            </svg>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}