import { motion } from 'framer-motion';

export function Aquario() {
    return (
        <div className="min-h-screen bg-blue-900">
            <div className="container mx-auto px-4 py-8">
                <motion.h1 
                    className="text-4xl font-bold text-white mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Acuario Amazónico
                </motion.h1>
                
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {/* Aquí puedes agregar más contenido sobre el acuario */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">Especies Destacadas</h2>
                        <p className="text-gray-600">
                            Descubre las maravillosas especies de peces amazónicos que habitan en nuestras aguas.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
} 