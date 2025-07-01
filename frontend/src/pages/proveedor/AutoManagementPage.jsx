import React, { useState } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AutoForm from '../../components/proveedor/AutoForm';
import ProductCard from '../../components/common/ProductCard';
import useAutos from '../../hooks/useAutos';
import ConfirmationModal from '../../components/common/ConfirmationModal';

const AutoManagementPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingAuto, setEditingAuto] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [autoToDelete, setAutoToDelete] = useState(null);
  const navigate = useNavigate();
  
  const { 
    autos, 
    loading, 
    error,
    createAuto,
    updateAuto,
    deleteAuto,
    fetchAutos
  } = useAutos('proveedor');

  const handleCreate = () => {
    setEditingAuto(null);
    setShowForm(true);
  };

  const handleEdit = (auto) => {
    setEditingAuto(auto);
    setShowForm(true);
  };

  const handleDelete = (auto) => {
    setAutoToDelete(auto);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAuto(autoToDelete._id);
      setShowDeleteModal(false);
      fetchAutos();
    } catch (err) {
      console.error('Error deleting auto:', err);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Autos</h1>
        <Button variant="success" onClick={handleCreate}>
          <FaPlus className="me-2" /> Nuevo Auto
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status" />
          <p className="mt-2">Cargando autos...</p>
        </div>
      ) : autos.length === 0 ? (
        <Alert variant="info">
          No tienes autos registrados. Crea tu primer auto.
        </Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {autos.map(auto => (
            <Col key={auto._id} className="d-flex mb-4">
              <div className="w-100 d-flex flex-column">
                <ProductCard 
                  key={`product-${auto._id}`}
                  product={auto}
                  type="auto"
                  onViewDetails={(id) => navigate(`/autos/${id}`)}
                />
                
                <div className="d-flex gap-2 mt-3">
                  <Button 
                    variant="warning"
                    className="flex-grow-1 text-nowrap"
                    onClick={() => handleEdit(auto)}
                  >
                    <FaEdit className="me-1 d-none d-sm-inline" />
                    <span>Editar</span>
                  </Button>
                  <Button 
                    variant="danger"
                    onClick={() => handleDelete(auto)}
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

      <AutoForm 
        show={showForm}
        onHide={() => setShowForm(false)}
        auto={editingAuto}
        onSuccess={handleFormSuccess}
        onCreate={createAuto}
        onUpdate={updateAuto}
      />

      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Auto"
        message={`¿Estás seguro de eliminar el auto "${autoToDelete?.modelo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </Container>
  );
};

export default AutoManagementPage;