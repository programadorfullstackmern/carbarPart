import React, { useState, useEffect } from 'react';
import { Modal, Carousel, Button } from 'react-bootstrap';
import { FaTimes, FaExpand, FaCompress } from 'react-icons/fa';

const ImageGalleryModal = ({ show, onHide, images = [] }) => {
  const [zoom, setZoom] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  const toggleZoom = () => {
    setZoom(!zoom);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (zoom) {
          setZoom(false);
        } else {
          onHide();
        }
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleZoom();
      }
    };

    if (show) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, zoom, onHide]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered 
      size="lg"
      className="gallery-modal"
      fullscreen={zoom}
    >
      <Modal.Header className="border-0 bg-dark bg-opacity-75 position-sticky top-0 z-3">
        <div className="d-flex justify-content-between w-100 align-items-center">
          <span className="text-white">
            {images.length > 0 ? `${activeIndex + 1} / ${images.length}` : '0/0'}
          </span>
          <div className="d-flex gap-2">
            {images.length > 0 && (
              <Button 
                variant="light"
                onClick={toggleZoom}
                aria-label={zoom ? "Reducir" : "Ampliar"}
              >
                {zoom ? <FaCompress /> : <FaExpand />}
              </Button>
            )}
            <Button 
              variant="light"
              onClick={onHide}
              aria-label="Cerrar"
            >
              <FaTimes />
            </Button>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="p-0" onClick={handleBackdropClick}>
        {images.length > 0 ? (
          <Carousel 
            activeIndex={activeIndex} 
            onSelect={handleSelect}
            indicators={images.length > 1}
            controls={images.length > 1}
            interval={null}
            prevLabel="Imagen anterior"
            nextLabel="Imagen siguiente"
          >
            {images.map((img, index) => (
              <Carousel.Item key={index}>
                <div 
                  className="d-flex align-items-center justify-content-center"
                  style={{ 
                    minHeight: zoom ? '85vh' : '50vh',
                    backgroundColor: '#0c0b0b',
                    cursor: 'zoom-in'
                  }}
                  onClick={toggleZoom}
                >
                  <img
                    src={img.url}
                    alt={`Imagen ${index + 1}`}
                    className="img-fluid"
                    style={{ 
                      maxHeight: zoom ? '85vh' : '50vh',
                      objectFit: 'contain',
                      width: 'auto',
                      maxWidth: '100%'
                    }}
                  />
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          <div className="d-flex align-items-center justify-content-center bg-light" style={{ minHeight: '300px' }}>
            <p className="text-muted mb-0">No hay imágenes disponibles</p>
          </div>
        )}
      </Modal.Body>
      
      {images.length > 1 && (
        <Modal.Footer className="justify-content-center border-0 bg-light py-2">
          <div className="d-flex gap-2 overflow-auto pb-1" style={{ maxWidth: '100%' }}>
            {images.map((img, index) => (
              <button
                key={index}
                className={`border rounded p-0 ${activeIndex === index ? 'border-primary' : 'border-secondary'}`}
                style={{ width: '60px', height: '45px', flexShrink: 0 }}
                onClick={() => handleSelect(index)}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <img
                  src={img.url}
                  alt={`Miniatura ${index + 1}`}
                  className="object-fit-cover w-100 h-100"
                />
              </button>
            ))}
          </div>
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default ImageGalleryModal;