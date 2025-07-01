import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { FaEye, FaSyncAlt } from 'react-icons/fa';
import { getStatusColor, getStatusText } from '../../utils/orderStatus'; // Importar helper

const OrdersPage = () => {
  const navigate = useNavigate();
  const { orders, loading, error, updateOrderStatus } = useAdmin();
  const [localOrders, setLocalOrders] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState({});

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Función para calcular el total de productos
  const getTotalProductos = (order) => {
    return order.items.length;
  };

  const handleStatusChange = async (orderId, status) => {
    setUpdatingStatus(prev => ({ ...prev, [orderId]: true }));
    try {
      await updateOrderStatus(orderId, status);
      setLocalOrders(prev => 
        prev.map(order => 
          order._id === orderId ? { ...order, estado: status } : order
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const statusColors = {
    pendiente: 'warning',
    procesando: 'info',
    enviada: 'success',
    entregada: 'primary',
    cancelada: 'danger'
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Gestión de Órdenes</h1>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2">Cargando órdenes...</p>
        </div>
      ) : localOrders.length === 0 ? (
        <Alert variant="info">
          <h4>No hay órdenes registradas</h4>
          <p>Actualmente no existen órdenes en el sistema.</p>
        </Alert>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <Table striped bordered hover responsive>
              <thead className="bg-light">
                {/* SOLUCIÓN: Eliminar espacios innecesarios */}
                <tr>
                  <th>N° Pedido</th><th>Fecha</th><th>Cliente</th><th>Total</th>
                  <th>Productos</th><th>Estado</th><th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {localOrders.map(order => (
                  // SOLUCIÓN: Mantener elementos en una sola línea
                  <tr key={order._id}>
                    <td>{order.numeroPedido || `#${order._id.substring(0, 8)}`}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.user?.nombre || 'Cliente eliminado'}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>{order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}</td>
                    <td><Badge bg={getStatusColor(order.estado)}>{getStatusText(order.estado)}</Badge></td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/admin/ordenes/${order._id}`)}
                        >
                          <FaEye />
                        </Button>
                        <div className="d-flex">
                          <select 
                            className="form-select"
                            value={order.estado}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            disabled={updatingStatus[order._id]}
                          >
                            {Object.keys(statusColors).map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            disabled={updatingStatus[order._id]}
                            onClick={() => handleStatusChange(order._id, order.estado)}
                          >
                            {updatingStatus[order._id] ? (
                              <Spinner size="sm" animation="border" />
                            ) : (
                              <FaSyncAlt />
                            )}
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default OrdersPage;