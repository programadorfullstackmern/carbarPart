import React, { useState } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PiezaForm from '../../components/proveedor/PiezaForm';
import ProductCard from '../../components/common/ProductCard';
import usePiezas from '../../hooks/usePiezas';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const PiezaManagementPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPieza, setEditingPieza] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [piezaToDelete, setPiezaToDelete] = useState(null);
  const navigate = useNavigate();
  
  const { 
    piezas, 
    loading, 
    error,
    createPieza,
    updatePieza,
    deletePieza,
    fetchPiezas
  } = usePiezas('proveedor');

  const handleCreate = () => {
    setEditingPieza(null);
    setShowForm(true);
  };

  const handleEdit = (pieza) => {
    setEditingPieza(pieza);
    setShowForm(true);
  };

  const handleDelete = (pieza) => {
    setPiezaToDelete(pieza);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePieza(piezaToDelete._id);
      setShowDeleteModal(false);
      fetchPiezas();
    } catch (err) {
      console.error('Error eliminando pieza:', err);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Piezas</h1>
        <Button variant="success" onClick={handleCreate}>
          <FaPlus className="me-2" /> Nueva Pieza
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Cargando piezas...</p>
        </div>
      ) : piezas.length === 0 ? (
        <Alert variant="info">
          No tienes piezas registradas. Crea tu primera pieza.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {piezas.map(pieza => (
            <Col key={pieza._id} className="d-flex mb-4">
              <div className="w-100 d-flex flex-column">
                <ProductCard 
                  key={`product-${pieza._id}`}
                  product={pieza}
                  type="pieza"
                  onViewDetails={(id) => navigate(`/piezas/${id}`)}
                />
                
                <div className="d-flex gap-2 mt-3">
                  <Button 
                    variant="warning"
                    className="flex-grow-1 text-nowrap"
                    onClick={() => handleEdit(pieza)}
                  >
                    <FaEdit className="me-1 d-none d-sm-inline" />
                    <span>Editar</span>
                  </Button>
                  <Button 
                    variant="danger"
                    onClick={() => handleDelete(pieza)}
                    className="flex-shrink-0"
                    aria-label="Eliminar"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      <PiezaForm 
        show={showForm}
        onHide={() => setShowForm(false)}
        pieza={editingPieza}
        onSuccess={handleFormSuccess}
        onCreate={createPieza}
        onUpdate={updatePieza}
      />

      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Pieza"
        message={`¿Estás seguro de eliminar la pieza "${piezaToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </Container>
  );
};

export default PiezaManagementPage;