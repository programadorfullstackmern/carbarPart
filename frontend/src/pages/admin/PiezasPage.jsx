import React, { useState } from 'react';
import { Table, Button, Container, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import { useAdmin } from '../../context/AdminContext';
import { formatCurrency } from '../../utils/helpers';
import PiezaForm from '../../components/admin/PiezaForm';

const PiezasPage = () => {
  const { piezas, loading, error, updatePiezaStock } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [selectedPieza, setSelectedPieza] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [newStock, setNewStock] = useState('');

  const handleEdit = (pieza) => {
    setSelectedPieza(pieza);
    setShowModal(true);
  };

  const handleUpdateStock = async (piezaId) => {
    if (!newStock || isNaN(newStock)) return;
    
    setUpdatingId(piezaId);
    try {
      await updatePiezaStock(piezaId, parseInt(newStock));
      setNewStock('');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPieza(null);
  };

  // Filtrar piezas con manejo seguro
  const filteredPiezas = piezas.filter(pieza => {
    const searchLower = searchTerm.toLowerCase();
    
    // Manejo seguro de propiedades
    const nombre = pieza.nombre ? pieza.nombre.toLowerCase() : '';
    const categoria = pieza.categoria ? pieza.categoria.toLowerCase() : '';
    
    return (
      nombre.includes(searchLower) ||
      categoria.includes(searchLower)
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
        <h1>Gestión de Piezas</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Nueva Pieza
        </Button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar piezas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Proveedor</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredPiezas.map(pieza => (
            <tr key={pieza._id}>
              <td>{pieza.nombre}</td>
              <td>{pieza.categoria}</td>
              <td>{pieza.proveedor?.nombre || 'Proveedor eliminado'}</td>
              <td>{formatCurrency(pieza.precio)}</td>
              <td>{pieza.stock}</td>
              <td>
                <Badge bg={pieza.stock > 0 ? 'success' : 'danger'}>
                  {pieza.stock > 0 ? 'Disponible' : 'Agotado'}
                </Badge>
              </td>
              <td>
                <Button 
                  variant="info" 
                  size="sm"
                  className="me-2 mb-2"
                  onClick={() => handleEdit(pieza)}
                >
                  Editar
                </Button>
                
                <div className="d-flex">
                  <input
                    type="number"
                    className="form-control form-control-sm me-2"
                    placeholder="Nuevo stock"
                    value={updatingId === pieza._id ? newStock : ''}
                    onChange={(e) => setNewStock(e.target.value)}
                    disabled={updatingId === pieza._id}
                    style={{ width: '100px' }}
                  />
                  <Button 
                    variant="warning" 
                    size="sm"
                    onClick={() => handleUpdateStock(pieza._id)}
                    disabled={!newStock || updatingId === pieza._id}
                  >
                    {updatingId === pieza._id ? (
                      <Spinner size="sm" animation="border" />
                    ) : 'Actualizar'}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {filteredPiezas.length === 0 && (
        <div className="text-center py-4">
          <p>No se encontraron piezas</p>
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedPieza ? 'Editar Pieza' : 'Nueva Pieza'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PiezaForm 
            pieza={selectedPieza} 
            onClose={handleCloseModal} 
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PiezasPage;