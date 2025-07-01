import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ordenAPI } from '../../api/orden';
import { FaEye, FaFileInvoice } from 'react-icons/fa';
import { getStatusColor, getStatusText } from '../../utils/orderStatus'; // Importar helper

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        // Ahora llamamos a la API sin parámetros
        const response = await ordenAPI.getUserOrders();
        setOrders(response);
      } catch (err) {
        setError(err.message || 'Error al cargar los pedidos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

 const getStatusBadge = (status) => {
    return <Badge bg={getStatusColor(status)}>{getStatusText(status)}</Badge>;
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p className="mt-2">Cargando historial de pedidos...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Mis Pedidos</h1>
      
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      
      {orders.length === 0 ? (
        <Alert variant="info">
          <h4>No tienes pedidos registrados</h4>
          <p>Una vez que realices un pedido, aparecerá aquí.</p>
          <Button variant="primary" onClick={() => navigate('/buscar')}>
            Ir a la tienda
          </Button>
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>N° Pedido</th>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order.numeroPedido || `#${order._id.substring(0, 8)}`}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                </td>
                <td>${order.total.toLocaleString()}</td>
                <td>{getStatusBadge(order.estado)}</td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => navigate(`/cliente/pedidos/${order._id}`)}
                  >
                    <FaEye className="me-1" /> Ver Detalles
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default OrderHistoryPage;