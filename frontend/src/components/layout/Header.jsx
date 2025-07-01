// src/components/layout/Header.jsx
import React from 'react';
import { Container, Nav, Navbar, Button, Spinner, NavDropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaCar, FaCog, FaShoppingCart, FaHistory, FaSearch } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

const accountLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '8px 12px'
};

const iconStyle = {
  lineHeight: '1',
  verticalAlign: 'middle',
  marginTop: '-2px'
};

const Header = () => {
  const { user, logout, authState } = useAuth();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (authState.status === 'checking' || 
      (authState.status === 'loading' && authState.operation === 'profile')) {
    return (
      <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand as={Link} to="/">CarBar & Parts</Navbar.Brand>
          <div className="ms-auto">
            <Spinner animation="border" variant="light" size="sm" />
          </div>
        </Container>
      </Navbar>
    );
  }

  const renderMainMenu = () => {
    if (!user) return null;
    
    const userRole = user.rol?.toLowerCase();
    
    switch(userRole) {
      case 'admin':
        return (
          <>
            <Nav.Link as={Link} to="/admin">Mi Panel</Nav.Link>
            <NavDropdown title="Gestión" id="admin-management-dropdown">
              <NavDropdown.Item as={Link} to="/admin/usuarios">Usuarios</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admin/ordenes">Órdenes</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admin/autos">Autos</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/admin/piezas">Piezas</NavDropdown.Item>
            </NavDropdown>
          </>
        );
      
      case 'proveedor':
        return (
          <>
            <Nav.Link as={Link} to="/proveedor">Mi Panel</Nav.Link>
            <NavDropdown title="Gestión" id="provider-management-dropdown">
              <NavDropdown.Item as={Link} to="/proveedor/autos">Mis Autos</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/proveedor/piezas">Mis Piezas</NavDropdown.Item>
            </NavDropdown>
          </>
        );
      
      case 'cliente':
        return (
          <>
            <Nav.Link as={Link} to="/cliente">Mi Panel</Nav.Link>
            <NavDropdown title="Tienda" id="tienda-dropdown">
              <NavDropdown.Item as={Link} to="/buscar">
                <FaSearch className="me-2" style={iconStyle} /> Búsqueda General
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/autos">
                <FaCar className="me-2" style={iconStyle} /> Autos
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/piezas">
                <FaCog className="me-2" style={iconStyle} /> Piezas
              </NavDropdown.Item>
            </NavDropdown>
            <Nav.Link as={Link} to="/cliente/carrito" className="d-flex align-items-center position-relative">
              <div className="position-relative">
                <FaShoppingCart style={iconStyle} size={18} />
                <Badge 
                  pill 
                  bg={totalItems > 0 ? "danger" : "secondary"} 
                  className="position-absolute"
                  style={{ 
                    fontSize: '0.65rem',
                    top: '0',
                    right: '0',
                    transform: 'translate(25%, -25%)',
                    minWidth: '18px',
                    minHeight: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: '1'
                  }}
                >
                  {totalItems}
                </Badge>
              </div>
              <span className="ms-2 d-none d-lg-inline">Carrito</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/cliente/pedidos" className="d-flex align-items-center">
              <FaHistory className="d-lg-none me-2" style={iconStyle} />
              <span className="d-none d-lg-inline">Mis Pedidos</span>
            </Nav.Link>
          </>
        );
      
      default:
        return <Nav.Link as={Link} to="/">Inicio</Nav.Link>;
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/">CarBar & Parts</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            {renderMainMenu()}
          </Nav>
          
          <Nav>
            {user ? (
              <>
                <Navbar.Text className="me-3 d-flex align-items-center">
                  <span className="d-none d-md-inline">Hola, </span>
                  {user.nombre || user.email}
                  <span className={`badge ms-2 ${
                    user.rol?.toLowerCase() === 'admin' ? 'bg-danger' :
                    user.rol?.toLowerCase() === 'proveedor' ? 'bg-warning text-dark' : 'bg-success'
                  }`}>
                    {user.rol}
                  </span>
                </Navbar.Text>
                
                <NavDropdown 
                  align="end"
                  title={
                    <div style={accountLinkStyle}>
                      <FaUser style={{ ...iconStyle, marginRight: '5px' }} />
                      <span>Mi Cuenta</span>
                    </div>
                  } 
                  id="account-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/perfil" style={accountLinkStyle}>
                    <FaUser style={iconStyle} /> <span>Perfil</span>
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} style={accountLinkStyle}>
                    Cerrar Sesión
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <Button variant="outline-light" as={Link} to="/login">
                Iniciar Sesión
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;