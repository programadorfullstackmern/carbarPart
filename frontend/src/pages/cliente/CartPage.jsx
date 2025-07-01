import React from "react";
import {
  Container,
  Table,
  Button,
  Row,
  Col,
  Card,
  Alert,
  Spinner,
} from "react-bootstrap";
import { FaShoppingCart, FaArrowLeft, FaTrash } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import CartItem from "../../components/cliente/CartItem";
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    loading,
    error,
  } = useCart();

  const handleCheckout = () => {
    navigate("/cliente/checkout");
  };

  // Estado de carga
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Cargando carrito...</p>
      </Container>
    );
  }

  // Manejo de errores
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h3>Error al cargar el carrito</h3>
          <p>{error}</p>
          <Button
            variant="primary"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  // Carrito vacío
  if (cartItems.length === 0) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="info">
          <h3>Tu carrito está vacío</h3>
          <p>Agrega productos para continuar</p>
        </Alert>
        <Button variant="primary" as={Link} to="/buscar">
          <FaArrowLeft className="me-2" /> Volver a comprar
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Carrito de Compras</h1>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio Unitario</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) =>
                item.name.includes("eliminado") ? (
                  <tr key={`${item.id}-${item.type}`}>
                    <td colSpan={5} className="text-danger">
                      Producto eliminado (ID: {item.id})
                    </td>
                  </tr>
                ) : (
                  <CartItem
                    key={`${item.id}-${item.type}`}
                    item={item}
                    onRemove={() => removeFromCart(item.id, item.type)}
                    onQuantityChange={(qty) =>
                      updateQuantity(item.id, item.type, qty)
                    }
                  />
                )
              )}
            </tbody>
          </Table>

          <div className="d-flex justify-content-end">
            <Button variant="outline-danger" onClick={clearCart}>
              <FaTrash className="me-2" /> Vaciar carrito
            </Button>
          </div>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Header as="h5">Resumen de Compra</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Envío:</span>
                <span>$0.00</span>
              </div>
              <div className="d-flex justify-content-between mb-3 fw-bold">
                <span>Total:</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100"
                onClick={handleCheckout}
              >
                <FaShoppingCart className="me-2" /> Proceder al Pago
              </Button>
            </Card.Body>
          </Card>

          <div className="mt-3">
            <Button
              variant="outline-secondary"
              className="w-100"
              as={Link}
              to="/buscar"
            >
              <FaArrowLeft className="me-2" /> Continuar Comprando
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CartPage;
