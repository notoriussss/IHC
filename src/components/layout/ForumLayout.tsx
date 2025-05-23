import React from 'react';
import { Categories } from '..';

interface ForumLayoutProps {
  children: React.ReactNode;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  showFavorites: boolean;
  onFavoritesToggle: () => void;
  onStartDiscussion: () => void;
}

const ForumLayout: React.FC<ForumLayoutProps> = ({
  children,
  selectedCategory,
  setSelectedCategory,
  showFavorites,
  onFavoritesToggle,
  onStartDiscussion
}) => {
  return (
    <>
      <div className="header">
        <i className="fa-solid fa-circle-user"></i>
        <input type="text" placeholder="Buscar foro" />
      </div>
      
      <div className="main-container">
        <div className="containerLeft">
          <div className="discution">
            <button type="button" onClick={onStartDiscussion}>
              Comenzar Discusión
            </button>
          </div>
          <div className="vitions">
            <button 
              className={`favorites-btn${showFavorites ? ' active' : ''}`}
              type="button"
              onClick={onFavoritesToggle}
            >
              <i className={`fas fa-star${showFavorites ? ' active' : ''}`}></i>
            </button>
          </div>
          <hr />
          <Categories 
            onSelectCategory={setSelectedCategory} 
            selectedCategory={selectedCategory}
          />
        </div>

        <div className="listForos">
          {children}
        </div>
      </div>
    </>
  );
};

export default ForumLayout;
