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
import { autoAPI } from '../../api/auto';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { handleApiResponse } from '../../api/responseHandler';

const AutoListPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [autos, setAutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    limit: 12
  });

  useEffect(() => {
    fetchAutos({});
  }, []);

  useEffect(() => {
    if (Object.keys(searchParams).length > 0 || pagination.page > 1) {
      fetchAutos({
        ...searchParams,
        pagina: pagination.page
      });
    }
  }, [pagination.page, searchParams]);

  const fetchAutos = async (params) => {
    try {
      setLoading(true);
      const response = await autoAPI.searchAutos({
        ...params,
        limite: pagination.limit
      });
      
      const { data, pagination: paginationData } = handleApiResponse(response);
      setAutos(data);
      setPagination(prev => ({
        ...prev,
        page: paginationData.page,
        totalPages: paginationData.totalPages
      }));
    } catch (err) {
      setError('Error al cargar autos: ' + err.message);
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
    navigate(`/autos/${id}`);
  };

  const handleAddToCart = async (auto) => {
    try {
      await addToCart({
        id: auto._id,
        name: auto.modelo,
        price: auto.precio,
        type: 'auto',
        image: auto.imagenes?.[0]?.url
      });
      toast.success('Auto añadido al carrito');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Catálogo de Autos</h1>
      
      <AdvancedSearch 
        type="auto" 
        onSearch={handleSearch} 
        initialParams={searchParams}
        isCliente={true}
      />
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-2">Cargando autos...</p>
        </div>
      ) : autos.length === 0 ? (
        <Alert variant="info">No se encontraron autos</Alert>
      ) : (
        <>
          <Row xs={1} md={2} lg={3} className="g-4">
            {autos.map(auto => (
              <Col key={auto._id}>
                <ProductCard  
                  product={auto}
                  type="auto"
                  onViewDetails={() => handleViewDetails(auto._id)}
                  onAddToCart={() => handleAddToCart(auto)}
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

export default AutoListPage;