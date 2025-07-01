import React from 'react';
import { Spinner } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, authState } = useAuth();

  if (authState.status === 'loading' || authState.status === 'checking') {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  // Redirigir según el rol si está autenticado
  if (authState.status === 'authenticated' && user) {
    const role = user.rol?.toLowerCase();
    switch(role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'proveedor':
        return <Navigate to="/proveedor" replace />;
      case 'cliente':
        return <Navigate to="/cliente" replace />;
      default:
        // Mantener en home si no coincide ningún rol
    }
  }

  // Mostrar contenido solo para usuarios no autenticados
  return (
    <div className="mt-5 pt-md-4 pt-lg-5 text-center">
      <h2>Bienvenido al Sistema</h2>
      <p className="lead">
        {user 
          ? `Has iniciado sesión como ${user.rol}`
          : 'Por favor inicia sesión para acceder a tu panel'}
      </p>
    </div>
  );
};

export default HomePage;