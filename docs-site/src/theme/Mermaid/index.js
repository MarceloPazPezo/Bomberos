import React, { useEffect, useRef, useState } from 'react';
import Mermaid from '@theme-original/Mermaid';

function MermaidZoomWrapper(props) {
  const containerRef = useRef(null);
  const mermaidRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.3, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.3, 0.5));
  };

  const handleReset = () => {
    setZoom(1);
    setTranslate({ x: 0, y: 0 });
  };



  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - translate.x,
        y: e.clientY - translate.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }

    if (isDragging && zoom > 1) {
      setTranslate({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    // Permitir zoom con Ctrl+scroll en el diagrama
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      const newZoom = Math.max(0.5, Math.min(3, zoom + delta));
      
      if (newZoom !== zoom) {
        // Ajustar la posición para que el zoom se centre en el cursor
        const zoomRatio = newZoom / zoom;
        setTranslate(prev => ({
          x: mouseX - (mouseX - prev.x) * zoomRatio,
          y: mouseY - (mouseY - prev.y) * zoomRatio
        }));
        setZoom(newZoom);
      }
    }
  };



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
    <div className="mermaid-zoom-container" ref={containerRef}>
      
      <div className="mermaid-zoom-controls">
        <button 
          className="mermaid-zoom-btn" 
          onClick={handleZoomIn}
          title="Acercar"
        >
          +
        </button>
        <button 
          className="mermaid-zoom-btn" 
          onClick={handleZoomOut}
          title="Alejar"
        >
          −
        </button>
        <button 
          className="mermaid-zoom-btn" 
          onClick={handleReset}
          title="Restablecer zoom"
        >
          ⌂
        </button>

      </div>
      
      {zoom !== 1 && (
        <div className="mermaid-zoom-indicator">
          {Math.round(zoom * 100)}%
        </div>
      )}
      
      <div 
        className="mermaid-content"
        style={{
          transform: `scale(${zoom}) translate(${translate.x / zoom}px, ${translate.y / zoom}px)`,
          transformOrigin: '0 0',
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        ref={mermaidRef}
      >
        <Mermaid {...props} />
      </div>
    </div>
  );
}

export default MermaidZoomWrapper;