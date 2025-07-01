import React, { useState } from 'react';
import { Table, Button, Container, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import { useAdmin } from '../../context/AdminContext';
import UserForm from '../../components/admin/UserForm';
import { formatDate } from '../../utils/helpers';

const UsersPage = () => {
  const { users, loading, error, createUser, updateUser, deleteUser } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    setDeletingId(userId);
    try {
      await deleteUser(userId);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Filtrar usuarios con manejo seguro
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    
    // Manejo seguro de propiedades
    const nombre = user.nombre ? user.nombre.toLowerCase() : '';
    const email = user.email ? user.email.toLowerCase() : '';
    const rol = user.rol ? user.rol.toLowerCase() : '';
    
    return (
      nombre.includes(searchLower) ||
      email.includes(searchLower) ||
      rol.includes(searchLower)
    );
  });

  if (loading && users.length === 0) {
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
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Usuarios</h1>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          Nuevo Usuario
        </Button>
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Registro</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user._id}>
              <td>{user.nombre}</td>
              <td>{user.email}</td>
              <td>
                <Badge bg={
                  user.rol === 'Administrador' ? 'danger' : 
                  user.rol === 'Proveedor' ? 'warning' : 'success'
                }>
                  {user.rol}
                </Badge>
              </td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                <Badge bg={user.activo ? 'success' : 'secondary'}>
                  {user.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </td>
              <td>
                <Button 
                  variant="info" 
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(user)}
                >
                  Editar
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDelete(user._id)}
                  disabled={deletingId === user._id}
                >
                  {deletingId === user._id ? (
                    <Spinner size="sm" animation="border" />
                  ) : 'Eliminar'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {filteredUsers.length === 0 && (
        <div className="text-center py-4">
          <p>No se encontraron usuarios</p>
        </div>
      )}

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UserForm 
            user={selectedUser} 
            onClose={handleCloseModal} 
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default UsersPage;