import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FaCar, FaCog, FaPlus, FaList, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { autoAPI } from '../../api/auto';
import { piezaAPI } from '../../api/pieza';
import AutoForm from '../../components/proveedor/AutoForm';
import PiezaForm from '../../components/proveedor/PiezaForm';

const ProveedorDashboard = () => {
  const [stats, setStats] = useState({
    autos: 0,
    piezas: 0,
    loading: true,
    error: ''
  });
  
  // Estados para controlar la visibilidad de los formularios
  const [showAutoForm, setShowAutoForm] = useState(false);
  const [showPiezaForm, setShowPiezaForm] = useState(false);

  // Función para cargar estadísticas
  const fetchStats = useCallback(async () => {
    setStats(prev => ({ ...prev, loading: true }));
    try {
      const [autosRes, piezasRes] = await Promise.all([
        autoAPI.getMyAutos(),
        piezaAPI.getMyPiezas()
      ]);
      setStats({
        autos: autosRes.length,
        piezas: piezasRes.length,
        loading: false,
        error: ''
      });
    } catch (err) {
      setStats({
        autos: 0,
        piezas: 0,
        loading: false,
        error: 'Error al cargar estadísticas'
      });
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Manejadores para creación exitosa
  const handleAutoCreated = () => {
    setShowAutoForm(false);
    fetchStats(); // Actualizar estadísticas
  };

  const handlePiezaCreated = () => {
    setShowPiezaForm(false);
    fetchStats(); // Actualizar estadísticas
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Panel del Proveedor</h1>
      
      {stats.error && <Alert variant="danger">{stats.error}</Alert>}
      
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <FaCar size={48} className="text-primary mb-3" />
              <Card.Title>Autos Registrados</Card.Title>
              {stats.loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Card.Text as="div" className="display-4 fw-bold">
                  {stats.autos}
                </Card.Text>
              )}
            </Card.Body>
            <Card.Footer className="bg-transparent border-0">
              <Link to="/proveedor/autos" className="btn btn-outline-primary w-100">
                <FaList className="me-2" /> Ver Autos
              </Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <FaCog size={48} className="text-primary mb-3" />
              <Card.Title>Piezas Registradas</Card.Title>
              {stats.loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <Card.Text as="div" className="display-4 fw-bold">
                  {stats.piezas}
                </Card.Text>
              )}
            </Card.Body>
            <Card.Footer className="bg-transparent border-0">
              <Link to="/proveedor/piezas" className="btn btn-outline-primary w-100">
                <FaList className="me-2" /> Ver Piezas
              </Link>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <FaPlus size={48} className="text-success mb-3" />
              <Card.Title>Agregar Auto</Card.Title>
              <Card.Text>
                Registra un nuevo auto en el sistema
              </Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0">
              <Button 
                variant="outline-success" 
                className="w-100"
                onClick={() => setShowAutoForm(true)}
              >
                <FaCar className="me-2" /> Nuevo Auto
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="h-100 shadow-sm text-center">
            <Card.Body>
              <FaPlus size={48} className="text-success mb-3" />
              <Card.Title>Agregar Pieza</Card.Title>
              <Card.Text>
                Registra una nueva pieza en el sistema
              </Card.Text>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0">
              <Button 
                variant="outline-success" 
                className="w-100"
                onClick={() => setShowPiezaForm(true)}
              >
                <FaCog className="me-2" /> Nueva Pieza
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">
                <FaChartLine className="me-2" /> Estadísticas Recientes
              </h5>
            </Card.Header>
            <Card.Body>
              {stats.loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Cargando estadísticas...</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <h3>Próximamente</h3>
                  <p className="text-muted">Estadísticas detalladas de ventas y rendimiento</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para crear nuevo auto */}
      <AutoForm 
        show={showAutoForm}
        onHide={() => setShowAutoForm(false)}
        onSuccess={handleAutoCreated}
        onCreate={autoAPI.createAuto}
        onUpdate={() => {}}
      />
      
      {/* Modal para crear nueva pieza */}
      <PiezaForm 
        show={showPiezaForm}
        onHide={() => setShowPiezaForm(false)}
        onSuccess={handlePiezaCreated}
        onCreate={piezaAPI.createPieza}
        onUpdate={() => {}}
      />
    </Container>
  );
};

export default ProveedorDashboard;