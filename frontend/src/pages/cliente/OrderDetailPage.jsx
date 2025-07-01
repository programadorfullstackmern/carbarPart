import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Spinner, Alert, Badge 
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint, FaExclamationTriangle } from 'react-icons/fa';
import { formatCurrency } from '../../utils/formatters';
import { ordenAPI } from '../../api/orden';
import { getStatusColor, getStatusText } from '../../utils/orderStatus'; // Importar helper


const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await ordenAPI.getOrderById(id);
        setOrder(response);
      } catch (err) {
        setError(err.message || 'Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);

  const getStatusBadge = (status) => {
    return (
      <Badge bg={getStatusColor(status)} className="fs-6 p-2">
        {getStatusText(status).toUpperCase()}
      </Badge>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 fs-5">Cargando detalles del pedido...</p>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <FaExclamationTriangle className="me-2" size={24} />
          <h4 className="mt-2">Error al cargar el pedido</h4>
          <p className="fs-5">{error || 'El pedido solicitado no existe'}</p>
          <Button 
            variant="primary" 
            className="mt-3"
            onClick={() => navigate('/cliente/pedidos')}
          >
            Volver al historial de pedidos
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button variant="outline-secondary" onClick={() => navigate('/cliente/pedidos')}>
          <FaArrowLeft className="me-2" /> Volver a Pedidos
        </Button>
        <Button variant="outline-primary" onClick={handlePrint}>
          <FaPrint className="me-2" /> Imprimir Comprobante
        </Button>
      </div>
      
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3">
          <h3 className="mb-0">Detalles del Pedido #{order.numeroPedido || `#${order._id.substring(0, 8)}`}</h3>
          <div className="d-flex align-items-center">
            <span className="me-2">Estado:</span>
            {getStatusBadge(order.estado)}
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <Card className="h-100">
                <Card.Header className="bg-light">
                  <h5>Información del Pedido</h5>
                </Card.Header>
                <Card.Body>
                  <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Hora:</strong> {new Date(order.createdAt).toLocaleTimeString()}</p>
                  <p><strong>Método de Pago:</strong> {order.metodoPago || 'No especificado'}</p>
                  <p className="mb-0"><strong>Número de Pedido:</strong> {order.numeroPedido || order._id}</p>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="h-100">
                <Card.Header className="bg-light">
                  <h5>Datos del Cliente</h5>
                </Card.Header>
                <Card.Body>
                  {order.user && typeof order.user === 'object' ? (
                    <>
                      <p><strong>Nombre:</strong> {order.user.nombre}</p>
                      <p><strong>Email:</strong> {order.user.email}</p>
                      <p className="mb-0"><strong>ID Usuario:</strong> {order.user._id}</p>
                    </>
                  ) : (
                    <p>Información de usuario no disponible</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row>
            <Col>
              <Card>
                <Card.Header className="bg-light">
                  <h5>Dirección de Entrega</h5>
                </Card.Header>
                <Card.Body>
                  {order.direccionEntrega ? (
                    <>
                      <p><strong>Nombre:</strong> {order.direccionEntrega.nombre}</p>
                      <p><strong>Dirección:</strong> {order.direccionEntrega.direccion}</p>
                      <p><strong>Ciudad:</strong> {order.direccionEntrega.ciudad}</p>
                      <p className="mb-0"><strong>Teléfono:</strong> {order.direccionEntrega.telefono}</p>
                    </>
                  ) : (
                    <p>No se proporcionó dirección de entrega</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-light py-3">
          <h5>Detalles de Productos</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped bordered hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th>Tipo</th>
                <th className="text-end">Precio Unitario</th>
                <th className="text-center">Cantidad</th>
                <th className="text-end">Subtotal</th>
              </tr>
            </thead>
            <tbody>
  {order.items
    .filter(item => item && item.tipoProducto)
    .map((item, index) => {
      // Acceder a los datos del producto normalizado
      const productData = item.producto || {};
      const productName = productData.nombre || 'Producto sin nombre';
      const imageUrl = productData.imagenes?.[0] || '';
      const productId = productData._id?.toString() || 'N/A';

      return (
        <tr key={index}>
          <td>
            <div className="d-flex align-items-center">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={productName} 
                  className="rounded me-3"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const fallback = e.target.parentNode.querySelector('.image-fallback');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : (
                <div 
                  className="bg-light me-3 rounded d-flex align-items-center justify-content-center" 
                  style={{ width: '60px', height: '60px' }}
                >
                  <span className="text-muted">Sin imagen</span>
                </div>
              )}
              
              <div>
                <div className="fw-medium">{productName}</div>
                <small className="text-muted">ID: {productId}</small>
                {item.sku && <small className="text-muted d-block">SKU: {item.sku}</small>}
              </div>
            </div>
          </td>
                      <td className="text-capitalize">{item.tipoProducto}</td>
                      <td className="text-end">{formatCurrency(item.precioUnitario)}</td>
                      <td className="text-center">{item.cantidad}</td>
                      <td className="text-end fw-medium">
                        {formatCurrency(item.precioUnitario * item.cantidad)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot className="table-group-divider">
              <tr>
                <td colSpan="4" className="text-end fw-bold">Total:</td>
                <td className="text-end fw-bold fs-5">
                  {formatCurrency(order.total)}
                </td>
              </tr>
            </tfoot>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderDetailPage;