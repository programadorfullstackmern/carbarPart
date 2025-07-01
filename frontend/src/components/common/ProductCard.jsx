// src/components/common/ProductCard.jsx
import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import ImageGalleryModal from './ImageGalleryModal';
import { FaCar, FaCog, FaShoppingCart, FaInfoCircle, FaImages } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const ProductCard = ({ product, type, onViewDetails, onAddToCart }) => {
  const [showGallery, setShowGallery] = useState(false);
  const { user } = useAuth(); // Obtenemos el usuario actual

  // Valores seguros con operadores de encadenamiento opcional
  const nombre = product?.nombre || '';
  const modelo = product?.modelo || '';
  const precio = product?.precio || 0;
  const anio = product?.anio || '';
  const stock = product?.stock || 0;
  const imagenes = product?.imagenes || [];
  const piezasCompatibles = product?.piezasCompatibles || [];
  const autosCompatibles = product?.autosCompatibles || [];

  // Determinar si el usuario es administrador
  const isAdmin = user?.rol?.toLowerCase() === 'admin';

  return (
    <div className="h-100 d-flex flex-column">
      <Card className="h-100 shadow-sm d-flex flex-column overflow-hidden">
        <div 
          className="bg-white cursor-pointer position-relative"
          onClick={() => setShowGallery(true)}
          style={{ 
            height: '200px',
            overflow: 'hidden'
          }}
        >
          {imagenes.length > 0 ? (
            <>
              <div 
                className="w-100 h-100 d-flex align-items-center justify-content-center"
                style={{ 
                  backgroundImage: `url(${imagenes[0].url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
              
              {imagenes.length > 1 && (
                <div className="position-absolute bottom-0 end-0 m-2">
                  <Badge 
                    pill 
                    bg="primary" 
                    className="d-flex align-items-center shadow-sm px-2 py-1"
                  >
                    <FaImages className="me-1" />
                    <span>{imagenes.length}</span>
                  </Badge>
                </div>
              )}
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-center text-muted bg-light w-100 h-100">
              {type === 'auto' ? <FaCar size={32} /> : <FaCog size={32} />}
            </div>
          )}
        </div>
        
        <Card.Body className="d-flex flex-column flex-grow-1">
          <Card.Title className="d-flex justify-content-between">
            <span className="text-truncate pe-2" title={modelo || nombre}>
              {modelo || nombre}
            </span>
            <span className="text-primary fw-bold flex-shrink-0">
              ${precio.toLocaleString()}
            </span>
          </Card.Title>
          
          <div className="text-muted small mb-3 flex-grow-1">
            {type === 'auto' ? (
              <>
                <p className="mb-1">Año: {anio}</p>
                {piezasCompatibles.length > 0 && (
                  <p className="mb-0">Piezas compatibles: {piezasCompatibles.length}</p>
                )}
              </>
            ) : (
              <>
                <p className="mb-1">Stock: {stock}</p>
                {autosCompatibles.length > 0 && (
                  <p className="mb-0">Autos compatibles: {autosCompatibles.length}</p>
                )}
              </>
            )}
          </div>
          
          <div className="d-grid gap-2 mt-auto pt-2 border-top">
            <Button 
              variant="outline-primary" 
              onClick={() => product?._id && onViewDetails(product._id)}
              className="text-nowrap"
            >
              <FaInfoCircle className="me-1" /> Detalles
            </Button>
            
            {/* Mostrar botón de agregar al carrito solo si:
                - Se proporciona la función onAddToCart
                - El usuario NO es administrador
                - Para piezas, solo si hay stock disponible */}
            {onAddToCart && !isAdmin && (
              <Button 
                variant="primary"
                onClick={() => onAddToCart(product)}
                disabled={type === 'pieza' && stock === 0}
                className="text-nowrap"
              >
                <FaShoppingCart className="me-1" />
                Agregar al carrito
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
      
      <ImageGalleryModal 
        show={showGallery}
        onHide={() => setShowGallery(false)}
        images={imagenes}
      />
    </div>
  );
};

export default ProductCard;