import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const rightToLeftVariants = {
    initial: { clipPath: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)' },
    animate: { clipPath: 'polygon(100% 0%, 0% 0%, 0% 100%, 100% 100%)' },
    exit: { clipPath: 'polygon(100% 0%, 100% 0%, 100% 0%, 100% 0%)' },
};

export function Culture() {
    const navigate = useNavigate();

    return (
        <motion.div
            className="relative w-full h-screen bg-[#3BA100] flex items-center justify-center text-white"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={rightToLeftVariants}
            transition={{ duration: 0.5 }}
        >
            <div
                className="absolute top-5 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center cursor-pointer"
                onClick={() => navigate('/')}
            >
                <img
                    src="/src/assets/logo/logo.svg"
                    alt="Logo"
                    className="w-80 h-auto"
                    style={{ userSelect: 'none' }}
                />
            </div>
            <h1 className="text-4xl">¡Bienvenido a la Página 2!</h1>
        </motion.div>
    );
}