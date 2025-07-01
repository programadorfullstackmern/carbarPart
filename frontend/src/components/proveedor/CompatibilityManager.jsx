import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaSearch, FaLink } from 'react-icons/fa';
import { autoAPI } from '../../api/auto';
import { piezaAPI } from '../../api/pieza';

const CompatibilityManager = ({ productId, type, currentItems = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [compatibleItems, setCompatibleItems] = useState([]);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    setCompatibleItems(currentItems);
  }, [currentItems]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      let results;
      if (type === 'auto') {
        results = await piezaAPI.searchPiezas({ nombre: searchTerm });
      } else {
        results = await autoAPI.searchAutos({ modelo: searchTerm });
      }
      setSearchResults(results.datos || results);
    } catch (err) {
      setError('Error al buscar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (itemId) => {
    try {
      setIsLinking(true);
      if (type === 'auto') {
        await autoAPI.linkPieza(productId, itemId);
      } else {
        await piezaAPI.linkAuto(productId, itemId);
      }
      setCompatibleItems([...compatibleItems, itemId]);
      setSearchResults(searchResults.filter(item => item._id !== itemId));
    } catch (err) {
      setError('Error al vincular: ' + err.message);
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlink = async (itemId) => {
    try {
      setIsUnlinking(true);
      if (type === 'auto') {
        await autoAPI.unlinkPieza(productId, itemId);
      } else {
        await piezaAPI.unlinkAuto(productId, itemId);
      }
      setCompatibleItems(compatibleItems.filter(id => id !== itemId));
    } catch (err) {
      setError('Error al desvincular: ' + err.message);
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <div className="mt-4">
      <h5 className="mb-3">
        <FaLink className="me-2" />
        {type === 'auto' ? 'Piezas Compatibles' : 'Autos Compatibles'}
      </h5>
      
      <Row className="g-2 mb-4">
        <Col md={8}>
          <Form.Control
            type="text"
            placeholder={`Buscar ${type === 'auto' ? 'piezas' : 'autos'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            aria-label="Buscar elementos"
          />
        </Col>
        <Col md={4}>
          <Button 
            variant="primary" 
            className="w-100" 
            onClick={handleSearch} 
            disabled={!searchTerm.trim() || loading}
          >
            <FaSearch className="me-2" /> Buscar
          </Button>
        </Col>
      </Row>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <div className="mb-4">
        <h6 className="mb-3">Resultados de Búsqueda</h6>
        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" />
            <p className="mt-2">Buscando...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <Alert variant="info">No se encontraron resultados</Alert>
        ) : (
          <ListGroup>
            {searchResults.map(item => (
              <ListGroup.Item 
                key={item._id} 
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <span className="fw-medium">{item.nombre || item.modelo}</span>
                  <Badge bg="secondary" className="ms-2">
                    ${item.precio?.toLocaleString()}
                  </Badge>
                </div>
                <Button 
                  variant="outline-success" 
                  size="sm"
                  onClick={() => handleLink(item._id)}
                  disabled={isLinking || compatibleItems.includes(item._id)}
                  aria-label="Vincular"
                >
                  <FaPlus /> Vincular
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>
      
      <div>
        <h6 className="mb-3">Elementos Vinculados</h6>
        {compatibleItems.length === 0 ? (
          <Alert variant="info">No hay elementos vinculados</Alert>
        ) : (
          <ListGroup>
            {compatibleItems.map(itemId => (
              <ListGroup.Item 
                key={itemId} 
                className="d-flex justify-content-between align-items-center"
              >
                <span className="text-truncate">{itemId}</span>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleUnlink(itemId)}
                  disabled={isUnlinking}
                  aria-label="Desvincular"
                >
                  <FaTrash /> Desvincular
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>
    </div>
  );
};

export default CompatibilityManager;