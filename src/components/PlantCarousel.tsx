import React, { useEffect, useState, useRef } from 'react';
import '../styles/Carousel.css';

interface Flor {
  id: number;
  nombre: string;
  nombreCientifico: string;
  imagen: string;
  ubicacion: string;
  tipoAgua: string;
  descripcion: string;
}

interface PlantCarouselProps {
  showMap?: boolean;
}

const PlantCarousel: React.FC<PlantCarouselProps> = ({ showMap = false }) => {
  const [flores, setFlores] = useState<Flor[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragThreshold] = useState(30); // Umbral mínimo para considerar un arrastre

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Iniciando carga de datos...');
        const response = await fetch('/data/flores.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos cargados:', data);
        if (data.flores && Array.isArray(data.flores)) {
          setFlores(data.flores);
          setIsLoading(false);
          console.log('Flores cargadas:', data.flores.length);
        } else {
          console.error('Formato de datos inválido:', data);
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Efecto para loguear la posición del carrusel
  useEffect(() => {
    if (carouselRef.current && !isLoading) {
      const logPosition = () => {
        const rect = carouselRef.current?.getBoundingClientRect();
        if (rect) {
          console.log('Carousel Position:', {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            windowSize: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            centerOffset: {
              x: Math.abs(rect.left + rect.width/2 - window.innerWidth/2),
              y: Math.abs(rect.top + rect.height/2 - window.innerHeight/2)
            },
            viewportCenter: {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2
            }
          });
        }
      };

      // Log inicial
      logPosition();

      // Log cuando cambia el tamaño de la ventana
      window.addEventListener('resize', logPosition);

      // Log cuando cambia el índice activo
      const observer = new MutationObserver(logPosition);
      observer.observe(carouselRef.current, {
        attributes: true,
        childList: true,
        subtree: true
      });

      return () => {
        window.removeEventListener('resize', logPosition);
        observer.disconnect();
      };
    }
  }, [activeIndex, isLoading]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    if (isAnimating || isLoading) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    if (isAnimating || isLoading) return;
    
    const clientX = 'touches' in e ? e.changedTouches[0].clientX : e.clientX;
    const dragDistance = clientX - dragStartX;
    
    if (Math.abs(dragDistance) > dragThreshold) {
      if (dragDistance > 0) {
        // Arrastre hacia la derecha -> activar modal izquierdo
        if (index === activeIndex) {
          moveToCenter(prevIndex);
        } else if (index === nextIndex) {
          moveToCenter(activeIndex);
        }
      } else {
        // Arrastre hacia la izquierda -> activar modal derecho
        if (index === activeIndex) {
          moveToCenter(nextIndex);
        } else if (index === prevIndex) {
          moveToCenter(activeIndex);
        }
      }
    }
  };

  const moveToCenter = (index: number) => {
    if (isAnimating || isLoading) return;
    setIsAnimating(true);

    let newIndex = index;
    if (index < 0) {
      newIndex = flores.length - 1;
    } else if (index >= flores.length) {
      newIndex = 0;
    }

    setActiveIndex(newIndex);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isAnimating || isLoading) return;
    
    // Prevenir el comportamiento por defecto del scroll
    e.preventDefault();
    
    // Determinar la dirección del scroll
    if (e.deltaY > 0) {
      // Scroll hacia abajo -> ir a la derecha
      moveToCenter(nextIndex);
    } else {
      // Scroll hacia arriba -> ir a la izquierda
      moveToCenter(prevIndex);
    }
  };

  // Early return if showMap is true (after all hooks)
  if (showMap) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="carousel-container" ref={carouselRef}>
        <div className="carousel">
          <div className="modal-container active">
            <h2 className="modal-title">Cargando...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (flores.length === 0) {
    console.log('No hay flores cargadas');
    return (
      <div className="carousel-container" ref={carouselRef}>
        <div className="carousel">
          <div className="modal-container active">
            <h2 className="modal-title">No hay flores disponibles</h2>
          </div>
        </div>
      </div>
    );
  }

  const prevIndex = (activeIndex - 1 + flores.length) % flores.length;
  const nextIndex = (activeIndex + 1) % flores.length;

  return (
    <div 
      className="carousel-container" 
      ref={carouselRef}
      onWheel={handleWheel}
    >
      <div className="carousel">
        {flores.map((flor, index) => {
          const isActive = index === activeIndex;
          const isPrev = index === prevIndex;
          const isNext = index === nextIndex;
          const isVisible = isActive || isPrev || isNext;

          return (
            <div
              key={flor.id}
              className={`modal-container ${isActive ? 'active' : ''} ${isPrev ? 'prev' : ''} ${isNext ? 'next' : ''}`}
              style={{
                visibility: isVisible ? 'visible' : 'hidden',
                opacity: isActive ? 1 : 0.6,
                cursor: 'pointer'
              }}
              onMouseDown={(e) => handleDragStart(e, index)}
              onMouseUp={(e) => handleDragEnd(e, index)}
              onTouchStart={(e) => handleDragStart(e, index)}
              onTouchEnd={(e) => handleDragEnd(e, index)}
              onClick={() => moveToCenter(index)}
            >
              <h2 className="modal-title">{flor.nombre}</h2>
              <p className="modal-subtitle">{flor.nombreCientifico}</p>
              <img src={flor.imagen} alt={flor.nombre} className="modal-image" />
              <div className="modal-info">
                <p><strong>Ubicación:</strong> {flor.ubicacion}</p>
                <p><strong>Tipo de Agua:</strong> {flor.tipoAgua}</p>
                <div className="modal-description">
                  {flor.descripcion}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlantCarousel; 