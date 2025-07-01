import React, { useEffect } from 'react';
import { Card, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { FaUsers, FaCar, FaCog, FaShoppingCart, FaChartLine } from 'react-icons/fa';
import Chart from 'react-apexcharts';

const AdminDashboard = () => {
  const { stats, loading, error, loadData } = useAdmin();

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Manejo seguro de stats (puede ser un objeto vacío)
  const safeStats = stats || {};
  
  // Configuración del gráfico de usuarios por rol
  const usersChartOptions = {
    chart: {
      type: 'donut',
    },
    labels: ['Administradores', 'Proveedores', 'Clientes'],
    colors: ['#FF4560', '#FEB019', '#00E396'],
    legend: {
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      formatter: function(val) {
        return Math.round(val) + "%";
      }
    },
    tooltip: {
      y: {
        formatter: function(value) {
          return value;
        }
      }
    }
  };

  const usersChartSeries = [
    safeStats.admins || 0,
    safeStats.providers || 0,
    safeStats.clients || 0
  ];

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Panel de Administración</h1>
      
      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card as={Link} to="/admin/usuarios" className="text-decoration-none h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaUsers size={32} className="text-primary me-3" />
                <div>
                  <Card.Title>Usuarios</Card.Title>
                  <Card.Text className="fs-4 fw-bold">
                    {safeStats.totalUsers || 0}
                  </Card.Text>
                </div>
              </div>
              <div className="mt-2 text-muted">
                <small>{safeStats.clients || 0} Clientes</small> • 
                <small> {safeStats.providers || 0} Proveedores</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card as={Link} to="/admin/ordenes" className="text-decoration-none h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaShoppingCart size={32} className="text-success me-3" />
                <div>
                  <Card.Title>Órdenes</Card.Title>
                  <Card.Text className="fs-4 fw-bold">
                    {safeStats.totalOrders || 0}
                  </Card.Text>
                </div>
              </div>
              <div className="mt-2 text-muted">
                <small>{safeStats.pendingOrders || 0} Pendientes</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card as={Link} to="/admin/autos" className="text-decoration-none h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaCar size={32} className="text-info me-3" />
                <div>
                  <Card.Title>Autos</Card.Title>
                  <Card.Text className="fs-4 fw-bold">
                    {safeStats.totalAutos || 0}
                  </Card.Text>
                </div>
              </div>
              <div className="mt-2 text-muted">
                <small>{safeStats.availableAutos || 0} Disponibles</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card as={Link} to="/admin/piezas" className="text-decoration-none h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <FaCog size={32} className="text-warning me-3" />
                <div>
                  <Card.Title>Piezas</Card.Title>
                  <Card.Text className="fs-4 fw-bold">
                    {safeStats.totalPiezas || 0}
                  </Card.Text>
                </div>
              </div>
              <div className="mt-2 text-muted">
                <small>{safeStats.availablePiezas || 0} Disponibles</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-4">
        <Col md={6}>
          <Card>
            <Card.Header className="d-flex align-items-center">
              <FaChartLine className="me-2" />
              Distribución de Usuarios
            </Card.Header>
            <Card.Body>
              <Chart
                options={usersChartOptions}
                series={usersChartSeries}
                type="donut"
                height={300}
              />
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header className="d-flex align-items-center">
              <FaChartLine className="me-2" />
              Resumen de Inventario
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-around text-center mb-4">
                <div>
                  <h4>{safeStats.totalAutos || 0}</h4>
                  <p className="text-muted">Autos</p>
                </div>
                <div>
                  <h4>{safeStats.availableAutos || 0}</h4>
                  <p className="text-muted">Disponibles</p>
                </div>
                <div>
                  <h4>{safeStats.totalPiezas || 0}</h4>
                  <p className="text-muted">Piezas</p>
                </div>
                <div>
                  <h4>{safeStats.availablePiezas || 0}</h4>
                  <p className="text-muted">Disponibles</p>
                </div>
              </div>
              
              <div className="progress mb-3" style={{ height: '20px' }}>
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar" 
                  style={{ 
                    width: `${safeStats.totalAutos ? 
                      (safeStats.availableAutos / safeStats.totalAutos) * 100 : 
                      0}%` 
                  }}
                  aria-valuenow={safeStats.availableAutos} 
                  aria-valuemin="0" 
                  aria-valuemax={safeStats.totalAutos}
                >
                  {safeStats.totalAutos ? 
                    Math.round((safeStats.availableAutos / safeStats.totalAutos) * 100) : 
                    0}% Autos
                </div>
              </div>
              
              <div className="progress" style={{ height: '20px' }}>
                <div 
                  className="progress-bar bg-info" 
                  role="progressbar" 
                  style={{ 
                    width: `${safeStats.totalPiezas ? 
                      (safeStats.availablePiezas / safeStats.totalPiezas) * 100 : 
                      0}%` 
                  }}
                  aria-valuenow={safeStats.availablePiezas} 
                  aria-valuemin="0" 
                  aria-valuemax={safeStats.totalPiezas}
                >
                  {safeStats.totalPiezas ? 
                    Math.round((safeStats.availablePiezas / safeStats.totalPiezas) * 100) : 
                    0}% Piezas
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;