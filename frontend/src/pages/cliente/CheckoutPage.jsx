import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordenAPI } from '../../api/orden';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Obtenemos el usuario autenticado
  const { cartItems, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    telefono: '',
    email: '',
    metodoPago: 'tarjeta',
  });

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        direccion: user.direccion || '',
        ciudad: user.ciudad || '',
        telefono: user.telefono || '',
        email: user.email || '',
        metodoPago: 'tarjeta'
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validación básica de datos de envío
      if (!formData.nombre || !formData.direccion || !formData.ciudad || !formData.telefono) {
        throw new Error('Por favor complete todos los campos de envío');
      }

      const orderData = {
        items: cartItems.map(item => ({
          productoId: item.id,
          tipoProducto: item.type,
          cantidad: item.quantity
        })),
        total: cartTotal,
        direccionEntrega: {
          nombre: formData.nombre,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          telefono: formData.telefono
        },
        metodoPago: formData.metodoPago
      };
      
      // Crear orden en el backend
      const orderResponse = await ordenAPI.createOrder(orderData);
      
      // Vaciar carrito y redirigir
      clearCart();
      navigate(`/cliente/pedidos/${orderResponse._id}`);
    } catch (err) {
      setError(err.message || 'Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Finalizar Compra</h1>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Header>
              <h5>Información de Envío</h5>
              <p className="text-muted mb-0">
                Tus datos de usuario se han precargado. Puedes editarlos si es necesario.
              </p>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="nombre">
                      <Form.Label>Nombre Completo</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="telefono">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group controlId="direccion" className="mb-3">
                  <Form.Label>Dirección</Form.Label>
                  <Form.Control
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Group controlId="ciudad">
                      <Form.Label>Ciudad</Form.Label>
                      <Form.Control
                        type="text"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Card className="mb-4">
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">Método de Pago</h6>
                  </Card.Header>
                  <Card.Body>
                    <Form.Group controlId="metodoPago">
                      <div className="d-flex flex-wrap gap-3">
                        <Form.Check
                          type="radio"
                          name="metodoPago"
                          id="tarjeta"
                          value="tarjeta"
                          label={
                            <div>
                              <span className="d-block">Tarjeta de Crédito/Débito</span>
                              <small className="text-muted">Pago seguro con tarjeta</small>
                            </div>
                          }
                          checked={formData.metodoPago === 'tarjeta'}
                          onChange={handleChange}
                          inline
                        />
                        <Form.Check
                          type="radio"
                          name="metodoPago"
                          id="paypal"
                          value="paypal"
                          label={
                            <div>
                              <span className="d-block">PayPal</span>
                              <small className="text-muted">Pago con cuenta PayPal</small>
                            </div>
                          }
                          checked={formData.metodoPago === 'paypal'}
                          onChange={handleChange}
                          inline
                        />
                        <Form.Check
                          type="radio"
                          name="metodoPago"
                          id="transferencia"
                          value="transferencia"
                          label={
                            <div>
                              <span className="d-block">Transferencia Bancaria</span>
                              <small className="text-muted">Transferencia directa</small>
                            </div>
                          }
                          checked={formData.metodoPago === 'transferencia'}
                          onChange={handleChange}
                          inline
                        />
                      </div>
                    </Form.Group>
                  </Card.Body>
                </Card>
                
                <div className="d-flex justify-content-end mt-4">
                  <Button 
                    variant="primary" 
                    size="lg"
                    type="submit"
                    disabled={loading}
                    className="px-5"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Procesando...
                      </>
                    ) : 'Confirmar Pedido'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
            <Card.Header className="bg-light">
              <h5 className="mb-0">Resumen del Pedido</h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <h6>Productos:</h6>
                <ul className="list-unstyled">
                  {cartItems.map(item => (
                    <li key={`${item.id}-${item.type}`} className="d-flex justify-content-between mb-2">
                      <div className="d-flex align-items-center">
                        {item.imagen ? (
                          <img 
                            src={item.imagen} 
                            alt={item.name} 
                            className="me-2 rounded"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-light rounded me-2" style={{ width: '40px', height: '40px' }}></div>
                        )}
                        <div>
                          <div className="fw-medium">{item.name}</div>
                          <small className="text-muted">x {item.quantity}</small>
                        </div>
                      </div>
                      <span className="fw-medium">${(item.price * item.quantity).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="d-flex justify-content-between fw-bold fs-5 border-top pt-3">
                <span>Total:</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
              
              <div className="mt-4">
                <div className="d-flex justify-content-between mb-1">
                  <span>Subtotal:</span>
                  <span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Envío:</span>
                  <span>$0.00</span>
                </div>
                <div className="d-flex justify-content-between mt-2 pt-2 border-top">
                  <span className="fw-bold">Total a pagar:</span>
                  <span className="fw-bold text-primary">${cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;