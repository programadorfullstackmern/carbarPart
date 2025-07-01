import React, { useState } from 'react';
import { Table, Button, Container, Spinner, Alert, Badge, Modal, Row, Col } from 'react-bootstrap';
import { useAdmin } from '../../context/AdminContext';
import { formatCurrency } from '../../utils/helpers';
import AutoForm from '../../components/admin/AutoForm';

const AutosPage = () => {
  const { autos, loading, error, updateAutoStatus } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [selectedAuto, setSelectedAuto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const handleEdit = (auto) => {
    setSelectedAuto(auto);
    setShowModal(true);
  };

  const handleToggleStatus = async (autoId, currentStatus) => {
    setUpdatingId(autoId);
    try {
      await updateAutoStatus(autoId, !currentStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAuto(null);
  };

  // Filtrar autos con manejo seguro de valores
  const filteredAutos = autos.filter(auto => {
    const searchLower = searchTerm.toLowerCase();
    
    // Manejo seguro de propiedades potencialmente undefined
    const marca = auto.marca ? auto.marca.toLowerCase() : '';
    const modelo = auto.modelo ? auto.modelo.toLowerCase() : '';
    const anio = auto.anio ? auto.anio.toString() : '';
    
    return (
      marca.includes(searchLower) ||
      modelo.includes(searchLower) ||
      anio.includes(searchTerm)
    );
  });

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

  return (
    <Container className="mt-5 pt-md-4 pt-lg-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Autos</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Nuevo Auto
        </Button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar autos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Año</th>
            <th>Proveedor</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredAutos.map(auto => (
            <tr key={auto._id}>
              <td>{auto.marca}</td>
              <td>{auto.modelo}</td>
              <td>{auto.anio}</td>
              <td>{auto.proveedor?.nombre || 'Proveedor eliminado'}</td>
              <td>{formatCurrency(auto.precio)}</td>
              <td>
                <Badge bg={auto.disponible ? 'success' : 'secondary'}>
                  {auto.disponible ? 'Disponible' : 'Agotado'}
                </Badge>
              </td>
              <td>
                <Button 
                  variant="info" 
                  size="sm"
                  className="me-2 mb-1"
                  onClick={() => handleEdit(auto)}
                >
                  Editar
                </Button>
                <Button 
                  variant={auto.disponible ? 'warning' : 'success'} 
                  size="sm"
                  className="mb-1"
                  onClick={() => handleToggleStatus(auto._id, auto.disponible)}
                  disabled={updatingId === auto._id}
                >
                  {updatingId === auto._id ? (
                    <Spinner size="sm" animation="border" />
                  ) : auto.disponible ? 'Desactivar' : 'Activar'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {filteredAutos.length === 0 && (
        <div className="text-center py-4">
          <p>No se encontraron autos</p>
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAuto ? 'Editar Auto' : 'Nuevo Auto'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AutoForm 
            auto={selectedAuto} 
            onClose={handleCloseModal} 
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AutosPage;