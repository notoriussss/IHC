import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import '../styles/Carousel.css';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

interface Animal {
  id: string;
  nombre: string;
  nombreCientifico: string;
  imagen: string;
  habitat: string;
  ubicacionGuayana: string[];
  tamano: string;
  peligroExtincion: string;
  dieta: string;
}

export interface AnimalCarouselHandles {
  goToNext: () => void;
  goToPrev: () => void;
}

interface AnimalCarouselProps {
  showMap?: boolean;
}

const getStatusColor = (status: string) => {
  if (status.toLowerCase().includes('en peligro crítico')) return '#FF4D4D';
  if (status.toLowerCase().includes('en peligro')) return '#FF7043';
  if (status.toLowerCase().includes('vulnerable')) return '#FFA726';
  if (status.toLowerCase().includes('casi amenazado')) return '#FFD54F';
  if (status.toLowerCase().includes('preocupación menor')) return '#4CAF50';
  return '#ffffff';
};

const AnimalCarousel = forwardRef<AnimalCarouselHandles, AnimalCarouselProps>(({ showMap = false }, ref) => {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Iniciando carga de datos de animales...');
        const response = await fetch('/data/animales.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos de animales cargados:', data);
        if (data.animales && Array.isArray(data.animales)) {
          setAnimales(data.animales);
          setIsLoading(false);
          console.log('Animales cargados:', data.animales.length);
        } else {
          console.error('Formato de datos inválido:', data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

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

      logPosition();
      window.addEventListener('resize', logPosition);

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

  const moveToCenter = (index: number) => {
    if (isAnimating || isLoading || animales.length === 0) return;
    setIsAnimating(true);

    let newIndex = index;
    if (index < 0) {
      newIndex = animales.length - 1;
    } else if (index >= animales.length) {
      newIndex = 0;
    }

    setActiveIndex(newIndex);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (isAnimating) return;
    
    if (event.deltaY > 0) {
      moveToCenter(activeIndex + 1);
    } else {
      moveToCenter(activeIndex - 1);
    }
  };

  useImperativeHandle(ref, () => ({
    goToNext: () => {
      if (animales.length > 0) {
        moveToCenter(activeIndex + 1);
      }
    },
    goToPrev: () => {
      if (animales.length > 0) {
        moveToCenter(activeIndex - 1);
      }
    }
  }));

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

  if (animales.length === 0) {
    return (
      <div className="carousel-container" ref={carouselRef}>
        <div className="carousel">
          <div className="modal-container active">
            <h2 className="modal-title">No hay animales disponibles</h2>
          </div>
        </div>
      </div>
    );
  }

  const prevIndex = (activeIndex - 1 + animales.length) % animales.length;
  const nextIndex = (activeIndex + 1) % animales.length;

  return (
    <div 
      className="carousel-container" 
      ref={carouselRef} 
      onWheel={handleWheel}
      style={{ 
        width: '100%', 
        maxWidth: '600px',
        padding: '20px',
        transform: 'scale(1)',
        transformOrigin: 'center center',
        transition: 'transform 0.3s ease-out'
      }}
    >
      <div className="carousel">
        {animales.map((animal, index) => {
          const isActive = index === activeIndex;
          const isPrev = index === prevIndex;
          const isNext = index === nextIndex;
          const isVisible = isActive || isPrev || isNext;

          return (
            <div
              key={animal.id}
              className={`modal-container ${isActive ? 'active' : ''} ${isPrev ? 'prev' : ''} ${isNext ? 'next' : ''}`}
              style={{
                visibility: isVisible ? 'visible' : 'hidden',
                opacity: isActive ? 1 : (isPrev || isNext ? 0.6 : 0),
                transition: 'opacity 0.5s ease, transform 0.5s ease, visibility 0.5s ease',
                background: 'rgba(13, 42, 76, 0.95)',
                borderRadius: '25px',
                padding: '20px',
                width: '450px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
                border: '1px solid rgba(255,255,255,0.1)',
                transformOrigin: 'center center'
              }}
              onClick={() => moveToCenter(index)}
            >
              <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '10px' }}>{animal.nombre}</h2>
              <p style={{ color: '#a0d8ef', fontSize: '1.2rem', marginBottom: '15px' }}>{animal.nombreCientifico}</p>
              <img src={animal.imagen} alt={animal.nombre} style={{ width: '100%', borderRadius: '15px', marginBottom: '15px', border: '2px solid #00C6FF' }} />
              <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '15px', borderRadius: '15px' }}>
                <p style={{ color: '#a0d8ef', marginBottom: '8px' }}><strong>Hábitat:</strong> {animal.habitat}</p>
                <p style={{ color: '#a0d8ef', marginBottom: '8px' }}><strong>Tamaño:</strong> {animal.tamano}</p>
                <p style={{ color: '#a0d8ef', marginBottom: '8px' }}>
                  <strong>Ubicación:</strong> {animal.ubicacionGuayana.join(', ')}
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: '#a0d8ef' }}>Estado:</strong>
                  <span style={{ color: getStatusColor(animal.peligroExtincion) }}> {animal.peligroExtincion}</span>
                </p>
                <p style={{ color: '#a0d8ef' }}><strong>Dieta:</strong> {animal.dieta}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

const AnimalCarousel3D = forwardRef<AnimalCarouselHandles, AnimalCarouselProps>(({ showMap = false }, ref) => {
  const [animales, setAnimales] = useState<Animal[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Iniciando carga de datos de animales...');
        const response = await fetch('/data/animales.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Datos de animales cargados:', data);
        if (data.animales && Array.isArray(data.animales)) {
          setAnimales(data.animales);
          setIsLoading(false);
          console.log('Animales cargados:', data.animales.length);
        } else {
          console.error('Formato de datos inválido:', data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const moveToCenter = (index: number) => {
    if (isAnimating || isLoading || animales.length === 0) return;
    setIsAnimating(true);

    let newIndex = index;
    if (index < 0) {
      newIndex = animales.length - 1;
    } else if (index >= animales.length) {
      newIndex = 0;
    }

    setActiveIndex(newIndex);
    setTimeout(() => setIsAnimating(false), 500);
  };

  useImperativeHandle(ref, () => ({
    goToNext: () => {
      if (animales.length > 0) {
        moveToCenter(activeIndex + 1);
      }
    },
    goToPrev: () => {
      if (animales.length > 0) {
        moveToCenter(activeIndex - 1);
      }
    }
  }));

  if (showMap) {
    return null;
  }

  if (isLoading) {
    return (
      <Html position={[0, 0, 0]} center>
        <div className="carousel-container">
          <div className="carousel">
            <div className="modal-container active">
              <h2 className="modal-title">Cargando...</h2>
            </div>
          </div>
        </div>
      </Html>
    );
  }

  if (animales.length === 0) {
    return (
      <Html position={[0, 0, 0]} center>
        <div className="carousel-container">
          <div className="carousel">
            <div className="modal-container active">
              <h2 className="modal-title">No hay animales disponibles</h2>
            </div>
          </div>
        </div>
      </Html>
    );
  }

  const prevIndex = (activeIndex - 1 + animales.length) % animales.length;
  const nextIndex = (activeIndex + 1) % animales.length;

  return (
    <Html
      position={[0, 0, -2.5]}
      center
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'all'
      }}
      distanceFactor={5}
      transform
      occlude
    >
      <div
        style={{
          width: '380px',
          height: 'auto',
          padding: '20px',
          borderRadius: '25px',
          backdropFilter: 'blur(15px) saturate(150%)',
          background: 'rgba(13, 42, 76, 0.92)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#f0f0f0',
          fontFamily: 'Roboto, sans-serif'
        }}
      >
        <div className="carousel-container" ref={carouselRef}>
          <div className="carousel">
            {animales.map((animal, index) => {
              const isActive = index === activeIndex;
              const isPrev = index === prevIndex;
              const isNext = index === nextIndex;
              const isVisible = isActive || isPrev || isNext;

              return (
                <div
                  key={animal.id}
                  className={`modal-container ${isActive ? 'active' : ''} ${isPrev ? 'prev' : ''} ${isNext ? 'next' : ''}`}
                  style={{
                    visibility: isVisible ? 'visible' : 'hidden',
                    opacity: isActive ? 1 : (isPrev || isNext ? 0.6 : 0),
                    transition: 'opacity 0.5s ease, transform 0.5s ease, visibility 0.5s ease'
                  }}
                  onClick={() => moveToCenter(index)}
                >
                  <h2 style={{ color: '#ffffff', fontSize: '1.8rem', marginBottom: '10px' }}>{animal.nombre}</h2>
                  <p style={{ color: '#a0d8ef', fontSize: '1.2rem', marginBottom: '15px' }}>{animal.nombreCientifico}</p>
                  <img src={animal.imagen} alt={animal.nombre} style={{ width: '100%', borderRadius: '15px', marginBottom: '15px', border: '2px solid #00C6FF' }} />
                  <div style={{ background: 'rgba(13, 42, 76, 0.95)', padding: '15px', borderRadius: '15px' }}>
                    <p style={{ color: '#a0d8ef', marginBottom: '8px' }}><strong>Hábitat:</strong> {animal.habitat}</p>
                    <p style={{ color: '#a0d8ef', marginBottom: '8px' }}><strong>Tamaño:</strong> {animal.tamano}</p>
                    <p style={{ color: '#a0d8ef', marginBottom: '8px' }}>
                      <strong>Ubicación:</strong> {animal.ubicacionGuayana.join(', ')}
                    </p>
                    <p style={{ marginBottom: '8px' }}>
                      <strong style={{ color: '#a0d8ef' }}>Estado:</strong>
                      <span style={{ color: getStatusColor(animal.peligroExtincion) }}> {animal.peligroExtincion}</span>
                    </p>
                    <p style={{ color: '#a0d8ef' }}><strong>Dieta:</strong> {animal.dieta}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Html>
  );
});

export default AnimalCarousel3D;

export { AnimalCarousel };