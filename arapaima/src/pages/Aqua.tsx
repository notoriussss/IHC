

import { motion } from 'framer-motion';


export function Aqua() {
    return (
        <div className="fixed inset-0 bg-black">
            {/* Comentario para activar/desactivar */}
            {/* Para continuar con el flujo normal, comenta este componente */}
            
            {/* Contenedor principal */}
            <div className="w-full h-full relative">
                {/* Sección izquierda */}
                <motion.div 
                    className="absolute top-0 left-0 w-1/2 h-full group cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                >
                    <img
                        src="/src/assets/icons/left.svg"
                        alt="Left"
                        className="w-full h-full opacity-50"
                    />
                    <div className="absolute inset-0 bg-transparent group-hover:bg-black/50 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span 
                            className="text-black text-4xl font-bold group-hover:text-white transition-colors duration-300"
                            initial={{ y: 20 }}
                            whileHover={{ y: 0 }}
                        >
                            IZQUIERDA
                        </motion.span>
                    </div>
                </motion.div>
                
                {/* Sección derecha */}
                <motion.div 
                    className="absolute top-0 right-0 w-1/2 h-full group cursor-pointer"
                    whileHover={{ scale: 1.1,
                        zIndex: 100,
                        opacity: 1,
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.img
                        src="/src/assets/background/rios1.jpg"
                        alt="Right"
                        className=" absolute top-0 right-0 w-full h-full object-fill  hover:opacity-100  transition-opacity duration-300"

                        style={
                            {clipPath: "polygon(0% 0, 100% 0, 100% 100%, 0% 50%)"}
                        }
                    />

                    
                    <div className="absolute inset-0 flex items-center justify-center">

                        <motion.span 
                            className="text-black text-4xl font-bold group-hover:text-white transition-colors duration-300"
                            initial={{ y: 20 }}
                            whileHover={{ y: 0 }}
                        >
                            DERECHA
                        </motion.span>
                    </div>

                </motion.div>

                {/* Sección central (abajo) */}
                <motion.div 
                    className="absolute bottom-0 left-0 w-full h-1/2 group cursor-pointer z-30"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                >
                    <img
                        src="/src/assets/background/region-guayana.png"
                        alt="Center"
                        className="absolute bottom-0 left-0 w-full h-full object-cover group-hover:opacity-20 transition-opacity duration-300"
                        style={{
                            clipPath: "polygon(50% 0%, 0 100%, 100% 100%)"
                        }}
                    />
                    <div className="absolute inset-0  " />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.span 
                            className="text-black text-4xl font-bold group-hover:text-white transition-colors duration-300"
                            initial={{ y: 20 }}
                            whileHover={{ y: 0 }}
                        >
                            CENTRO
                        </motion.span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}