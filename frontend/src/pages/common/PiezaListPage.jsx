import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Spinner, 
  Alert, 
  Pagination 
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard';
import AdvancedSearch from '../../components/common/AdvancedSearch';
import { piezaAPI } from '../../api/pieza';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { handleApiResponse } from '../../api/responseHandler';

const PiezaListPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [piezas, setPiezas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 12
  });

  useEffect(() => {
    fetchPiezas({});
  }, []);

  useEffect(() => {
    if (Object.keys(searchParams).length > 0 || pagination.page > 1) {
      fetchPiezas({
        ...searchParams,
        pagina: pagination.page
      });
    }
  }, [pagination.page, searchParams]);

  const fetchPiezas = async (params) => {
    try {
      setLoading(true);
      const response = await piezaAPI.searchPiezas({
        ...params,
        limite: pagination.limit
      });
      
      const { data, pagination: paginationData } = handleApiResponse(response);
      setPiezas(data);
      setPagination(prev => ({
        ...prev,
        page: paginationData.page,
        totalPages: paginationData.totalPages
      }));
    } catch (err) {
      setError('Error al cargar piezas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (params) => {
    setSearchParams(params);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleViewDetails = (id) => {
    navigate(`/piezas/${id}`);
  };

  const handleAddToCart = async (pieza) => {
    try {
      await addToCart({
        id: pieza._id,
        name: pieza.nombre,
        price: pieza.precio,
        type: 'pieza',
        image: pieza.imagenes?.[0]?.url
      });
      toast.success('Pieza añadida al carrito');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Catálogo de Piezas</h1>
      
      <AdvancedSearch 
        type="pieza" 
        onSearch={handleSearch} 
        initialParams={searchParams}
        isCliente={true}
      />
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2">Cargando piezas...</p>
        </div>
      ) : piezas.length === 0 ? (
        <Alert variant="info">No se encontraron piezas</Alert>
      ) : (
        <>
          <Row xs={1} md={2} lg={3} className="g-4">
            {piezas.map(pieza => (
              <Col key={pieza._id}>
                <ProductCard 
                  product={pieza}
                  type="pieza"
                  onViewDetails={() => handleViewDetails(pieza._id)}
                  onAddToCart={() => handleAddToCart(pieza)}
                  disabled={pieza.stock === 0}
                />
              </Col>
            ))}
          </Row>
          
          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  disabled={pagination.page === 1} 
                  onClick={() => handlePageChange(pagination.page - 1)} 
                />
                {[...Array(pagination.totalPages).keys()].map(num => (
                  <Pagination.Item 
                    key={num + 1}
                    active={num + 1 === pagination.page}
                    onClick={() => handlePageChange(num + 1)}
                  >
                    {num + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next 
                  disabled={pagination.page === pagination.totalPages} 
                  onClick={() => handlePageChange(pagination.page + 1)} 
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default PiezaListPage;