import React, { useState } from 'react';
import './NewDiscussionForm.css';
import { useSuccessMessage } from '../../context/SuccessMessageContext';

interface NewDiscussionFormProps {
  onClose: () => void;
  onSubmit: (title: string, content: string, category: string) => void;
}

const CATEGORIES = [
  { id: 'Nuestros Pueblos', label: 'Nuestros Pueblos', icon: 'fas fa-home' },
  { id: 'Contaminacion', label: 'Contaminación', icon: 'fas fa-smog' },
  { id: 'Economia', label: 'Economía', icon: 'fas fa-chart-line' },
  { id: 'Proyectos', label: 'Proyectos', icon: 'fas fa-project-diagram' },
  { id: 'Turismo', label: 'Turismo', icon: 'fas fa-umbrella-beach' }
];

export const NewDiscussionForm: React.FC<NewDiscussionFormProps> = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccessMessage } = useSuccessMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      if (!title.trim()) {
        setError('Por favor, ingresa un título para tu discusión');
        return;
      }
      
      if (!content.trim()) {
        setError('Por favor, escribe el contenido de tu discusión');
        return;
      }
      
      if (!category) {
        setError('Por favor, selecciona una categoría');
        return;
      }

      await onSubmit(title, content, category);
      showSuccessMessage('¡Discusión publicada con éxito!');
      onClose();
    } catch (error) {
      setError('Error al publicar la discusión. Por favor, intenta de nuevo.');
      console.error('Error al publicar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>Nueva Discusión</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escribe un título para tu discusión"
              disabled={isSubmitting}
            />
          </div>

          <div className="category-section">
            <label>Categoría</label>
            <div className="category-options">
              {CATEGORIES.map((cat) => (
                <label key={cat.id} className="category-option">
                  <input
                    type="radio"
                    name="category"
                    value={cat.id}
                    checked={category === cat.id}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <i className={cat.icon}></i>
                  <span className="category-label">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content">Contenido</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe el contenido de tu discusión..."
              disabled={isSubmitting}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar Discusión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDiscussionForm; 