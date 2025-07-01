import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminProvider } from './context/AdminContext';
import AppNavbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';
import ProfilePage from './pages/auth/ProfilePage';
import HomePage from './pages/HomePage';
import ProveedorDashboard from './pages/proveedor/ProveedorDashboard';
import AutoManagementPage from './pages/proveedor/AutoManagementPage';
import PiezaManagementPage from './pages/proveedor/PiezaManagementPage';
import ClienteDashboard from './pages/cliente/ClienteDashboard';
import SearchResultsPage from './pages/common/SearchResultsPage';
import CartPage from './pages/cliente/CartPage';
import CheckoutPage from './pages/cliente/CheckoutPage';
import OrderHistoryPage from './pages/cliente/OrderHistoryPage';
import OrderDetailPage from './pages/cliente/OrderDetailPage';
import ProductDetailPage from './pages/common/ProductDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import OrdersPage from './pages/admin/OrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AutoListPage from './pages/common/AutoListPage';
import PiezaListPage from './pages/common/PiezaListPage';
import CartNotification from './components/common/CartNotification';
import Footer from '../src/components/layout/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
        <div className="d-flex flex-column min-vh-100">
          <AppNavbar />
          <CartNotification /> {/* Componente de notificaciones */}
          <div className="flex-grow-1">
          <Container className="pt-5 pb-4">
            <Routes>
              {/* Rutas públicas */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Rutas privadas sin rol específico */}
              <Route path="/" element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              } />
              
              <Route path="/perfil" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />

              {/* Ruta de búsqueda avanzada */}
              <Route path="/buscar" element={
                <PrivateRoute>
                  <SearchResultsPage />
                </PrivateRoute>
              } />

              {/* Rutas de listados */}
              <Route path="/autos" element={
                <PrivateRoute>
                  <AutoListPage />
                </PrivateRoute>
              } />
              
              <Route path="/piezas" element={
                <PrivateRoute>
                  <PiezaListPage />
                </PrivateRoute>
              } />

              {/* Rutas de detalles de productos */}
              <Route path="/autos/:id" element={
                <PrivateRoute>
                  <ProductDetailPage type="auto" />
                </PrivateRoute>
              } />
              
              <Route path="/piezas/:id" element={
                <PrivateRoute>
                  <ProductDetailPage type="pieza" />
                </PrivateRoute>
              } />

              {/* Rutas de cliente */}
              <Route path="/cliente/*" element={
                <PrivateRoute roles={['cliente']}>
                  <Routes>
                    <Route index element={<ClienteDashboard />} />
                    <Route path="carrito" element={<CartPage />} />
                    <Route path="checkout" element={<CheckoutPage />} />
                    <Route path="pedidos" element={<OrderHistoryPage />} />
                    <Route path="pedidos/:id" element={<OrderDetailPage />} />
                  </Routes>
                </PrivateRoute>
              } />
              
              {/* Rutas de proveedor */}
              <Route path="/proveedor/*" element={
                <PrivateRoute roles={['proveedor']}>
                  <Routes>
                    <Route index element={<ProveedorDashboard />} />
                    <Route path="autos" element={<AutoManagementPage />} />
                    <Route path="piezas" element={<PiezaManagementPage />} />
                  </Routes>
                </PrivateRoute>
              } />
              
              {/* Rutas de administrador */}
              <Route path="/admin/*" element={
                <PrivateRoute roles={['admin']}>
                  <AdminProvider>
                    <Routes>
                      <Route index element={<AdminDashboard />} />
                      <Route path="ordenes/:id" element={<AdminOrderDetailPage />} />
                      <Route path="usuarios" element={<UsersPage />} />
                      <Route path="ordenes" element={<OrdersPage />} />
                      {/* Agrega estas nuevas rutas */}
        <Route path="autos" element={<AutoListPage  />} />
        <Route path="piezas" element={<PiezaListPage  />} />
                    </Routes>
                  </AdminProvider>
                </PrivateRoute>
              } />
              
              {/* Ruta de respaldo para errores 404 */}
              <Route path="*" element={
                <PrivateRoute>
                  <div className="text-center py-5">
                    <h1>404 - Página no encontrada</h1>
                    <p>La página que buscas no existe.</p>
                  </div>
                </PrivateRoute>
              } />
            </Routes>
          </Container>
           </div>
          <Footer/>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);