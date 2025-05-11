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
            {/* Logo para volver a la página principal */}
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

            <div className="flex-1 p-8 max-w-7xl mx-auto text-white rounded-lg shadow-lg overflow-y-auto">
                {/* Botón para volver */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-4 text-white font-bold hover:underline"
                >
                    ← Volver
                </button>

                {/* Título */}
                <h1 className="text-3xl font-bold mb-6 text-white">{article.title}</h1>

                {/* Imágenes */}
                <div className="flex flex-col items-center justify-center gap-4 mb-6">
                    {article.images.map((image, index) => (
                        <img
                            key={index}
                            src={image}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-[400px] object-cover rounded-lg shadow-md"
                        />
                    ))}
                </div>

                {/* Contenido dividido en párrafos */}
                <div className="text-base leading-relaxed text-white space-y-4">
                    {article.content.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>

                {/* Fuente */}
                <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-4 text-white font-bold hover:underline"
                >
                    Leer más en la fuente original
                </a>
            </div>
        </div>
    );
}