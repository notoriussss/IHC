// src/components/LanzaGuisante.js
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

const LanzaGuisante = () => {
  const { scene } = useGLTF('/models/lanza_guisante_plants_vs_zombies.glb'); // Asegúrate de que la ruta sea correcta

  return <primitive object={scene} />;
};

export default LanzaGuisante;