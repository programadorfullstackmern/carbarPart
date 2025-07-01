import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner, Tab, Tabs, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaShoppingCart, FaEdit, FaTrash, FaCar, FaCog, FaLink, FaUnlink } from 'react-icons/fa';
import ImageGalleryModal from '../../components/common/ImageGalleryModal';
import CompatibilityManager from '../../components/proveedor/CompatibilityManager';
import { useAuth } from '../../context/AuthContext';
import { autoAPI } from '../../api/auto';
import { piezaAPI } from '../../api/pieza';
import { useCart } from '../../context/CartContext';

const ProductDetailPage = ({ type }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGallery, setShowGallery] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const response = type === 'auto' 
        ? await autoAPI.getAutoById(id) 
        : await piezaAPI.getPiezaById(id);
      
      // Verificar si se recibió una respuesta válida
      if (!response || !response.data) {
        throw new Error('Producto no encontrado');
      }
      
      setProduct(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al cargar el producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchProduct();
}, [id, type]);

  const handleAddToCart = () => {
    addToCart({
      id: product._id,
      name: type === 'auto' ? product.modelo : product.nombre,
      price: product.precio,
      type,
      image: product.imagenes?.[0]?.url
    });
  };

  if (loading) {
  return (
    <Container className="py-5 text-center">
      <Spinner animation="border" />
      <p>Cargando producto...</p>
    </Container>
  );
}

if (error || !product) {
  return (
    <Container className="py-5">
      <Alert variant="danger">
        {error || 'Producto no encontrado'}
        <div className="mt-2">
          <Button variant="primary" onClick={() => window.history.back()}>
            Volver atrás
          </Button>
        </div>
      </Alert>
    </Container>
  );
} 

  return (
    <Container className="py-4">
      <Button variant="primary" onClick={() => window.history.back()}>
            Volver atrás
          </Button>
      <Row>
        <Col lg={6} className="mb-4">
          <div className="ratio ratio-1x1 bg-light rounded overflow-hidden cursor-pointer">
            {product.imagenes?.length > 0 ? (
              <img
                src={product.imagenes[0].url}
                alt={type === 'auto' ? product.modelo : product.nombre}
                className="object-fit-cover w-100 h-100"
                onClick={() => setShowGallery(true)}
              />
            ) : (
              <div className="d-flex align-items-center justify-content-center text-muted">
                {type === 'auto' ? (
                  <FaCar size={64} />
                ) : (
                  <FaCog size={64} />
                )}
              </div>
            )}
          </div>
          
          {product.imagenes?.length > 1 && (
            <div className="d-flex mt-3 gap-2 overflow-auto pb-2">
              {product.imagenes.slice(1).map((img, index) => (
                <div 
                  key={index}
                  className="ratio ratio-1x1 rounded overflow-hidden"
                  style={{ width: '80px', flexShrink: 0 }}
                  onClick={() => setShowGallery(true)}
                >
                  <img 
                    src={img.url} 
                    alt={`Imagen ${index + 2}`}
                    className="object-fit-cover w-100 h-100"
                  />
                </div>
              ))}
            </div>
          )}
        </Col>
        
        <Col lg={6}>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h1>{type === 'auto' ? product.modelo : product.nombre}</h1>
              <h2 className="text-primary">${product.precio.toLocaleString()}</h2>
            </div>
            
            {user.role === 'cliente' && (
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleAddToCart}
                disabled={type === 'pieza' && product.stock === 0}
              >
                <FaShoppingCart className="me-2" />
                Agregar al carrito
              </Button>
            )}
          </div>
          
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3"
          >
            <Tab eventKey="details" title="Detalles">
              <div className="mt-3">
                {type === 'auto' ? (
                  <>
                    <p><strong>Año:</strong> {product.anio}</p>
                    <p><strong>Proveedor:</strong> {product.proveedor?.nombre}</p>
                    <p className="mb-0">
                      <strong>Piezas compatibles:</strong> {product.piezasCompatibles?.length || 0}
                    </p>
                  </>
                ) : (
                  <>
                    <p><strong>Descripción:</strong> {product.descripcion}</p>
                    <p><strong>Stock disponible:</strong> {product.stock}</p>
                    <p><strong>Proveedor:</strong> {product.proveedor?.nombre}</p>
                    <p className="mb-0">
                      <strong>Autos compatibles:</strong> {product.autosCompatibles?.length || 0}
                    </p>
                  </>
                )}
              </div>
            </Tab>
            
            <Tab eventKey="compatibility" title="Compatibilidad">
  <CompatibilityManager 
    productId={id}
    type={type}
    currentItems={
      type === 'auto' 
        ? product.piezasCompatibles?.map(p => p._id) || []
        : product.autosCompatibles?.map(a => a._id) || []
    }
  />
</Tab>
          </Tabs>
          
          {user.role === 'proveedor' && (
            <div className="d-flex gap-2 mt-4">
              <Button variant="warning" className="flex-grow-1">
                <FaEdit className="me-2" /> Editar
              </Button>
              <Button variant="danger">
                <FaTrash />
              </Button>
            </div>
          )}
        </Col>
      </Row>
      
      <ImageGalleryModal 
        show={showGallery}
        onHide={() => setShowGallery(false)}
        images={product.imagenes}
      />
    </Container>
  );
};

export default ProductDetailPage;