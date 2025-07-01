import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Card, Spinner } from 'react-bootstrap'; // Importar Spinner
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, updateProfile, authState, error } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  });
  
  const [success, setSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null); // Estado local para errores
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
        direccion: user.direccion || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setUpdateError(null);
    
    try {
      await updateProfile(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      // Manejar el error específico de actualización
      setUpdateError(err.message || 'Error actualizando perfil');
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  if (!user) return null;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header as="h5">Mi Perfil</Card.Header>
        <Card.Body>
          {success && <Alert variant="success">Perfil actualizado correctamente!</Alert>}
          
          {/* Mostrar error de actualización */}
          {updateError && (
            <Alert variant="danger" className="text-center">
              {updateError}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit"
              disabled={authState.operation === 'update' && authState.status === 'loading'}
            >
              {authState.operation === 'update' && authState.status === 'loading' 
                ? (
                  <>
                    <Spinner 
                      as="span" 
                      animation="border" 
                      size="sm" 
                      role="status"
                      className="me-2"
                    />
                    Guardando...
                  </>
                )
                : 'Guardar Cambios'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProfilePage;