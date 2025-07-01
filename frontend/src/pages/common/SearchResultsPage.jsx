import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import ProductCard from '../../components/common/ProductCard';
import AdvancedSearch from '../../components/common/AdvancedSearch';
import { autoAPI } from '../../api/auto';
import { piezaAPI } from '../../api/pieza';
import { useCart } from '../../context/CartContext';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [autos, setAutos] = useState([]);
  const [piezas, setPiezas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('autos');
  const [searchParams, setSearchParams] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = Object.fromEntries(params.entries());
    setSearchParams(query);
    
    if (Object.keys(query).length > 0) {
      fetchResults(query);
    } else {
      // Si no hay parámetros, cargar productos destacados
      loadFeaturedProducts();
    }
  }, [location.search]);

  const fetchResults = async (params) => {
    try {
      setLoading(true);
      const [autosRes, piezasRes] = await Promise.all([
        autoAPI.searchAutos(params),
        piezaAPI.searchPiezas(params)
      ]);
      
      // Manejar diferentes estructuras de respuesta
      setAutos(Array.isArray(autosRes) ? autosRes : 
              autosRes.datos ? autosRes.datos : 
              autosRes.data ? autosRes.data : []);
              
      setPiezas(Array.isArray(piezasRes) ? piezasRes : 
               piezasRes.datos ? piezasRes.datos : 
               piezasRes.data ? piezasRes.data : []);
    } catch (err) {
      setError('Error al buscar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const [autosRes, piezasRes] = await Promise.all([
        autoAPI.searchAutos({ destacado: true, limit: 6 }),
        piezaAPI.searchPiezas({ destacado: true, limit: 12 })
      ]);
      
      setAutos(autosRes.datos || autosRes.data || autosRes || []);
      setPiezas(piezasRes.datos || piezasRes.data || piezasRes || []);
    } catch (err) {
      console.error("Error cargando productos destacados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (params) => {
    const queryString = new URLSearchParams(params).toString();
    navigate(`/buscar?${queryString}`);
  };

  const handleViewDetails = (id, type) => {
    navigate(`/${type}/${id}`);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">
        {Object.keys(searchParams).length > 0 
          ? "Resultados de Búsqueda" 
          : "Explora Nuestra Tienda"}
      </h1>
      
      <AdvancedSearch 
        type={activeTab} 
        onSearch={handleSearch} 
        initialParams={searchParams}
        isCliente={true}
      />
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="autos" title={`Autos (${autos.length})`}>
          <div className="mt-3">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
                <p className="mt-2">Buscando autos...</p>
              </div>
            ) : autos.length === 0 ? (
              <Alert variant="info">No se encontraron autos</Alert>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {autos.map(auto => (
                  <Col key={auto._id}>
                    <ProductCard 
                      product={auto}
                      type="auto"
                      onViewDetails={() => handleViewDetails(auto._id, 'autos')}
                      onAddToCart={() => addToCart({
                        id: auto._id,
                        name: auto.modelo,
                        price: auto.precio,
                        type: 'auto',
                        image: auto.imagenes?.[0]?.url
                      })}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Tab>
        
        <Tab eventKey="piezas" title={`Piezas (${piezas.length})`}>
          <div className="mt-3">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
                <p className="mt-2">Buscando piezas...</p>
              </div>
            ) : piezas.length === 0 ? (
              <Alert variant="info">No se encontraron piezas</Alert>
            ) : (
              <Row xs={1} md={2} lg={3} className="g-4">
                {piezas.map(pieza => (
                  <Col key={pieza._id}>
                    <ProductCard 
                      product={pieza}
                      type="pieza"
                      onViewDetails={() => handleViewDetails(pieza._id, 'piezas')}
                      onAddToCart={() => addToCart({
                        id: pieza._id,
                        name: pieza.nombre,
                        price: pieza.precio,
                        type: 'pieza',
                        image: pieza.imagenes?.[0]?.url
                      })}
                      disabled={pieza.stock === 0}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Tab>
      </Tabs>
      
      {Object.keys(searchParams).length === 0 && (
        <div className="mt-5 text-center">
          <h3>¿No encuentras lo que buscas?</h3>
          <p className="lead">
            Utiliza nuestra búsqueda avanzada para encontrar exactamente lo que necesitas
          </p>
        </div>
      )}
    </Container>
  );
};

export default SearchResultsPage;