import React, { useState, useRef, useEffect } from 'react';
import styles from './ImageViewer.module.css';

const ImageViewer = ({ src, alt, title }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomActive, setIsZoomActive] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const handleZoomIn = () => {
    setIsZoomActive(true);
    setScale(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    const newScale = scale / 1.2;
    setScale(prev => Math.max(prev / 1.2, 0.1));
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 });
      setIsZoomActive(false);
    }
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomActive(false);
  };

  const handleImageClick = () => {
    // No hacer nada si se acaba de arrastrar
    if (hasDragged) {
      setHasDragged(false);
      return;
    }
    
    if (!isZoomActive) {
      setIsZoomActive(true);
      setScale(1.5);
    } else if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsZoomActive(false);
    }
  };

  const handleMouseDown = (e) => {
    if (scale > 1) {
      setIsDragging(true);
      setHasDragged(false);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      setHasDragged(true);
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    // Deshabilitar zoom con scroll - solo permitir zoom manual
    e.preventDefault();
    // Comentado para evitar zoom automático con scroll
    // const delta = e.deltaY > 0 ? 0.9 : 1.1;
    // setScale(prev => Math.max(0.1, Math.min(5, prev * delta)));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      handleReset();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'Escape':
            setIsFullscreen(false);
            break;
          case '+':
          case '=':
            handleZoomIn();
            break;
          case '-':
            handleZoomOut();
            break;
          case '0':
            handleReset();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <>
      <div className={styles.imageViewer} ref={containerRef}>
        <div className={styles.toolbar}>
          <button onClick={handleZoomIn} className={styles.toolButton} title="Zoom In (+)">
            🔍+
          </button>
          <button onClick={handleZoomOut} className={styles.toolButton} title="Zoom Out (-)">
            🔍-
          </button>
          <button onClick={handleReset} className={styles.toolButton} title="Reset (0)">
            ↺
          </button>
          <button onClick={toggleFullscreen} className={styles.toolButton} title="Fullscreen">
            ⛶
          </button>
          <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
        </div>
        
        <div 
          className={styles.imageContainer}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        >
          <img
            ref={imageRef}
            src={src}
            alt={alt}
            className={styles.image}
            style={{
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transformOrigin: 'center center',
              cursor: isZoomActive && scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
            }}
            onClick={handleImageClick}
            draggable={false}
          />
        </div>
        
        {title && <div className={styles.title}>{title}</div>}
      </div>

      {isFullscreen && (
        <div className={styles.fullscreenOverlay} onClick={toggleFullscreen}>
          <div className={styles.fullscreenContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.fullscreenToolbar}>
              <button onClick={handleZoomIn} className={styles.toolButton}>
                🔍+
              </button>
              <button onClick={handleZoomOut} className={styles.toolButton}>
                🔍-
              </button>
              <button onClick={handleReset} className={styles.toolButton}>
                ↺
              </button>
              <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
              <button onClick={toggleFullscreen} className={styles.closeButton}>
                ✕
              </button>
            </div>
            
            <div 
              className={styles.fullscreenImageContainer}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
              <img
                src={src}
                alt={alt}
                className={styles.fullscreenImage}
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  transformOrigin: 'center center',
                  cursor: isZoomActive && scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
                }}
                onClick={handleImageClick}
                draggable={false}
              />
            </div>
            
            <div className={styles.fullscreenTitle}>{title}</div>
            <div className={styles.instructions}>
              Use mouse wheel to zoom, drag to pan, or use keyboard: +/- to zoom, 0 to reset, ESC to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageViewer;