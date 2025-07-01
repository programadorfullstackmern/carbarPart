import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [sessionMessage, setSessionMessage] = useState('');
  const { login, authState, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Comprobar si hay mensaje de sesión expirada
  useEffect(() => {
    const message = sessionStorage.getItem('sessionMessage');
    if (message) {
      setSessionMessage(message);
      sessionStorage.removeItem('sessionMessage');
    }
  }, []);

  // Redirección después de login exitoso
  useEffect(() => {
    if (authState.status === 'authenticated') {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [authState.status, navigate, location]);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    
    // Limpiar error al cambiar los campos
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError(); // Limpiar cualquier error previo
    
    // Intentar hacer login
    await login(credentials);
  };

  // Determinar si está cargando
  const isLoading = authState.operation === 'login' && authState.status === 'loading';

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h1 className="text-center mb-4">Inicio de Sesión</h1>
      
      {sessionMessage && (
        <Alert variant="warning" className="text-center">
          {sessionMessage}
        </Alert>
      )}
      
      {error && (
        <Alert 
          variant={
            error.type === 'user_not_found' ? 'warning' : 
            error.type === 'invalid_credentials' ? 'danger' : 'info'
          } 
          className="text-center"
        >
          {error.message}
        </Alert>
      )}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            placeholder="Ingresa tu email"
            required
            autoFocus
            disabled={isLoading}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            placeholder="Ingresa tu contraseña"
            required
            disabled={isLoading}
          />
        </Form.Group>

        <div className="d-grid">
          <Button 
            variant="primary" 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner 
                  as="span" 
                  animation="border" 
                  size="sm" 
                  role="status" 
                  className="me-2"
                />
                Verificando...
              </>
            ) : 'Ingresar'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default LoginPage;