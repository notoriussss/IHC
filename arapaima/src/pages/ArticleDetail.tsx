import { useParams, useNavigate } from 'react-router-dom';
import articles from '@/data/data.json';

export function ArticleDetail() {
    const { id } = useParams(); // Obtener el ID del artículo desde la URL
    const navigate = useNavigate();
    const article = articles[parseInt(id || '0')]; // Obtener el artículo correspondiente

    if (!article) {
        return <p>Artículo no encontrado</p>;
    }

    return (
        <div
            className="min-h-screen bg-[#3BA100] text-white flex flex-col"
            style={{
                backgroundImage: "url('/src/assets/background/background-culture.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                userSelect: 'none',
            }}
        >
            {/* Contenedor del logo */}
            <div
                className="relative top-5 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer"
                onClick={() => navigate('/')}
            >
                <img
                    src="/src/assets/logo/logo.svg"
                    alt="Logo"
                    className="w-80 h-auto"
                    style={{ userSelect: 'none' }}
                />
            </div>

            {/* Contenedor principal */}
            <div className="flex-1 p-8 max-w-7xl mx-auto text-white grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Columna izquierda */}
                <div className="flex flex-col gap-6">
                    {/* Botón para volver */}
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 text-white font-bold hover:underline self-start"
                    >
                        ← Volver
                    </button>

                    {/* Título */}
                    <h1 className="text-4xl font-bold leading-tight">{article.title}</h1>

                    {/* Imágenes */}
                    <div className="flex flex-col gap-4">
                        {article.images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Imagen ${index + 1}`}
                                className="w-full h-[400px] object-cover rounded-lg shadow-md"
                            />
                        ))}
                    </div>

                    {/* Fuente */}
                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-4 font-bold hover:underline"
                    >
                        Leer más en la fuente original
                    </a>
                </div>

                {/* Columna derecha */}
                <div className="flex flex-col gap-4 text-xl leading-loose mt-16">
                    {article.content.split('\n').map((paragraph, index) => (
                        <p
                            key={index}
                            className={index === 0 ? 'first-letter:text-6xl first-letter:font-bold first-letter:mr-2 first-letter:float-left' : ''}
                        >
                            {paragraph}
                        </p>
                    ))}
                </div>
            </div>
        </div>
    );
}