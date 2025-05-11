import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import libraryData from '@/data/library.json'; // Importamos los datos de los libros

const leftBottomToTopRightVariants = {
    initial: { clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)' },
    animate: { clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)' },
    exit: { clipPath: 'polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%)' },
};

export function Library() {
    const navigate = useNavigate();

    // Dividimos los libros en tres secciones
    const leftBooks = libraryData.slice(0, 5); // Libros para el contenedor izquierdo
    const centerBook = libraryData[5]; // Libro para el contenedor central
    const rightBooks = libraryData.slice(6, 11); // Libros para el contenedor derecho

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
                        className="w-60 h-auto" // Reducimos el tamaño del logo
                        style={{ userSelect: 'none' }}
                    />
                </div>
            </div>

            {/* Enmascarador */}
            <div className="relative w-[300px] h-[250px] my-4"> {/* Reducimos el tamaño */}
                <svg className="w-full h-full" viewBox="0 0 721 734" preserveAspectRatio="xMidYMid meet">
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
                        href={centerBook.images[0]} // Imagen del libro central
                        width="100%"
                        height="100%"
                        preserveAspectRatio="xMidYMid meet"
                        mask="url(#mask-library)"
                    />
                </svg>
            </div>

            {/* Contenedor principal para la librería */}
            <div className="flex items-center justify-center gap-4"> {/* Reducimos el espacio entre contenedores */}
                {/* Contenedor izquierdo */}
                <div className="grid grid-cols-3 gap-2"> {/* Reducimos el espacio entre columnas */}
                    {leftBooks.map((book, index) => (
                        <div key={index} className="relative w-[150px] h-[175px]"> {/* Reducimos el tamaño */}
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
                                    preserveAspectRatio="xMidYMid slice" // Aseguramos que la imagen se ajuste
                                    mask={`url(#mask-left-${index})`}
                                />
                            </svg>
                        </div>
                    ))}
                </div>

                {/* Elemento central */}
                <div className="relative w-[200px] h-[250px]"> {/* Reducimos el tamaño */}
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
                            href={centerBook.images[0]} // Imagen del libro central
                            width="100%"
                            height="100%"
                            preserveAspectRatio="xMidYMid slice" // Aseguramos que la imagen se ajuste
                            mask="url(#mask-center)"
                        />
                    </svg>
                </div>

                {/* Contenedor derecho */}
                <div className="grid grid-cols-3 gap-2"> {/* Reducimos el espacio entre columnas */}
                    {rightBooks.map((book, index) => (
                        <div key={index} className="relative w-[150px] h-[175px]"> {/* Reducimos el tamaño */}
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
                                    preserveAspectRatio="xMidYMid slice" // Aseguramos que la imagen se ajuste
                                    mask={`url(#mask-right-${index})`}
                                />
                            </svg>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}