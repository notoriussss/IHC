import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function Aqua() {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 bg-black">
            <div className="w-full h-full relative">
                {/* Sección izquierda */}
                <motion.div 
                    className="absolute top-0 left-0 w-1/2 h-full group cursor-pointer"
                    whileHover={{ 
                        scale: 1.02,
                        zIndex: 10
                    }}
                    transition={{ duration: 0.3 }}
                    onClick={() => navigate('/aquarium')}
                >
                    <motion.img
                        src="\src\assets\background\pez.jpg"
                        alt="Left"
                        className="w-full h-full"
                        style= {{
                            clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 100%)"
                        }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span 
                            className="text-black text-4xl font-bold hover:text-white transition-colors duration-300"
                            initial={{ y: 20 }}
                            whileHover={{ y: 0 }}
                        >
                            PECES
                        </motion.span>
                    </div>
                </motion.div>
                
                {/* Sección derecha */}
                <motion.div 
                    className="absolute top-0 right-0 w-1/2 h-full group cursor-pointer"
                    whileHover={{ 
                        scale: 1.1,
                        zIndex: 20
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.img
                        src="/src/assets/background/rios1.jpg"
                        alt="Right"
                        className="absolute top-0 right-0 w-full h-full object-fill"
                        style={{
                            clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 50%)"
                        }}
                    />
                    <motion.div 
                        className="absolute inset-0 bg-black"
                        initial={{ opacity: 0.5 }}
                        whileHover={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 50%)"
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span 
                            className="text-white text-4xl font-bold hover:text-white transition-colors duration-300"
                            initial={{ y: 20 }}
                            whileHover={{ y: 0 }}
                        >
                            RIOS
                        </motion.span>
                    </div>
                </motion.div>

                {/* Sección central (abajo) */}
                <motion.div 
                    className="absolute bottom-0 left-0 w-full h-1/2 group cursor-pointer"
                    whileHover={{ 
                        scale: 1.02,
                        zIndex: 30
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.img
                        src="/src/assets/background/region-guayana.png"
                        alt="Center"
                        className="absolute bottom-0 left-0 w-full h-full object-cover"
                        style={{
                            clipPath: "polygon(50% 0%, 0 100%, 100% 100%)"
                        }}
                    />
                    <motion.div 
                        className="absolute inset-0 bg-black"
                        initial={{ opacity: 0.5 }}
                        whileHover={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            clipPath: "polygon(50% 0%, 0 100%, 100% 100%)"
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span 
                            className="text-white text-4xl font-bold hover:text-white transition-colors duration-300"
                            initial={{ y: 20 }}
                            whileHover={{ y: 0 }}
                        >
                            MAPAS
                        </motion.span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}