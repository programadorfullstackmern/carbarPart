import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

const PrivateRoute = ({ children, roles = [] }) => {
  const { user, authState } = useAuth();
  const location = useLocation();

  // Estados de carga inicial
  if (authState.status === 'checking' || 
      (authState.status === 'loading' && authState.operation === 'profile')) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </div>
    );
  }

  // Usuario no autenticado
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Normalizar roles para comparación
  const userRole = user.rol?.toLowerCase();
  const normalizedRoles = roles.map(role => role.toLowerCase());
  
  // Verificar si el usuario tiene el rol necesario
  const hasRequiredRole = roles.length === 0 || normalizedRoles.includes(userRole);

  if (hasRequiredRole) {
    return children;
  }

  // Si no tiene el rol requerido
  return (
    <div className="container mt-5 text-center">
      <Alert variant="danger">
        <h4>Acceso no autorizado</h4>
        <p className="mb-0">
          No tienes permisos para acceder a esta sección.
          {roles.length > 0 && (
            <span> Rol requerido: {roles.join(', ')}</span>
          )}
        </p>
      </Alert>
      <Button 
        variant="primary" 
        className="mt-3"
        onClick={() => window.history.back()}
      >
        Volver atrás
      </Button>
    </div>
  );
};

export default PrivateRoute;