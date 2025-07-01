import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaHistory, FaCar, FaCog } from 'react-icons/fa';

const ClienteDashboard = () => {
  const navigate = useNavigate(); // Añade esta línea

  return (
    <Container className="py-4">
      <h1 className="mb-4">Panel del Cliente</h1>
      
      <Row className="g-4 mb-4">
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <FaCar size={48} className="text-primary mb-3" />
              <Card.Title>Buscar Autos</Card.Title>
              <Card.Text>
                Explora nuestra colección de autos disponibles
              </Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0">
              <Link to="/autos" className="btn btn-primary w-100">
                <FaSearch className="me-2" /> Buscar Autos
              </Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <FaCog size={48} className="text-primary mb-3" />
              <Card.Title>Buscar Piezas</Card.Title>
              <Card.Text>
                Encuentra las piezas que necesitas para tu auto
              </Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0">
              <Link to="/piezas" className="btn btn-primary w-100">
                <FaSearch className="me-2" /> Buscar Piezas
              </Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <FaShoppingCart size={48} className="text-success mb-3" />
              <Card.Title>Mi Carrito</Card.Title>
              <Card.Text>
                Revisa y gestiona los productos en tu carrito
              </Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0">
              <Link to="/cliente/carrito" className="btn btn-success w-100">
                <FaShoppingCart className="me-2" /> Ver Carrito
              </Link>
            </Card.Footer>
          </Card>
        </Col>
        
        {/* Actualizar tarjeta de historial de pedidos */}
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <FaHistory size={48} className="text-info mb-3" />
              <Card.Title>Historial de Pedidos</Card.Title>
              <Card.Text>
                Revisa el estado de tus pedidos anteriores
              </Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0">
              <Button 
                variant="info" 
                className="w-100" 
                onClick={() => navigate('/cliente/pedidos')} // Ahora navigate está definido
              >
                <FaHistory className="me-2" /> Ver Pedidos
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <FaCar size={48} className="text-warning mb-3" />
              <Card.Title>Autos Favoritos</Card.Title>
              <Card.Text>
                Accede a tus autos guardados como favoritos
              </Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0">
              <Button variant="warning" className="w-100" disabled>
                Próximamente
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={6} lg={4}>
          <Card className="h-100 shadow-sm">
            <Card.Body className="text-center">
              <FaCog size={48} className="text-warning mb-3" />
              <Card.Title>Piezas Favoritas</Card.Title>
              <Card.Text>
                Accede a tus piezas guardadas como favoritas
              </Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0">
              <Button variant="warning" className="w-100" disabled>
                Próximamente
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ClienteDashboard;