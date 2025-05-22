// Importación de React y estilos CSS
import React from 'react';
import './Categories.css';
import { Category } from '../../../types';

/**
 * Interfaz para las props del componente Categories
 * @property {(category: string | null) => void} onSelectCategory - Función callback que se ejecuta al seleccionar una categoría
 * @property {string | null} selectedCategory - Categoría seleccionada actualmente
 */
interface CategoriesProps {
  onSelectCategory: (category: string | null) => void;
  selectedCategory?: string | null;
  onFavoritesToggle?: (show: boolean) => void;
}

/**
 * Componente Categories - Muestra una lista de categorías seleccionables
 * @param {CategoriesProps} props - Recibe la función onSelectCategory y selectedCategory como props
 * @returns {JSX.Element} Lista de botones de categorías
 */
const Categories: React.FC<CategoriesProps> = ({ onSelectCategory, selectedCategory }) => {
  // Array de categorías con sus propiedades
  const categories: Category[] = [
    {
      id: 'general',
      name: 'General',
      icon: 'fas fa-globe',
      color: '#1976d2'
    },
    {
      id: 'pueblos',
      name: 'Nuestros Pueblos',
      icon: 'fas fa-home',
      color: '#2e7d32'
    },
    {
      id: 'contaminacion',
      name: 'Contaminación',
      icon: 'fas fa-smog',
      color: '#d84315'
    },
    {
      id: 'economia',
      name: 'Economía',
      icon: 'fas fa-chart-line',
      color: '#7b1fa2'
    },
    {
      id: 'proyectos',
      name: 'Proyectos',
      icon: 'fas fa-project-diagram',
      color: '#f57c00'
    },
    {
      id: 'turismo',
      name: 'Turismo',
      icon: 'fas fa-umbrella-beach',
      color: '#0288d1'
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      onSelectCategory(null); // Deseleccionar si ya está seleccionada
    } else {
      onSelectCategory(categoryId);
    }
  };

  return (
    // Contenedor principal de los botones de categoría
    <div className="categories-list">
      {/* Mapeo del array de categorías para renderizar cada botón */}
      {categories.map((category) => (
        <button
          key={category.id} // Clave única para optimización de React
          className={`category-item${selectedCategory === category.id ? ' active' : ''}`}
          // Handler para el click que ejecuta la función prop con el nombre de categoría
          onClick={() => handleCategoryClick(category.id)}
          style={{ 
            '--category-color': category.color
          } as React.CSSProperties}
        >
          {/* Icono que representa visualmente la categoría */}
          <i className={category.icon} style={{ color: category.color }}></i>
          {/* Etiqueta visible de la categoría */}
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default Categories;