// src/components/common/AdvancedSearch.jsx
import React from 'react';
import { Form, Row, Col, Button, Accordion, Badge } from 'react-bootstrap';
import { FaSearch, FaFilter, FaUndo } from 'react-icons/fa';

const AdvancedSearch = ({ type, onSearch, initialParams = {}, isCliente = false }) => {
  const [formData, setFormData] = React.useState({
    q: '',
    ...(type === 'auto' ? { 
      modelo: '',
      modeloExacto: '',
      modelos: '',
      anioMin: '',
      anioMax: '',
    } : {
      nombre: '',
      nombreExacto: '',
      nombres: '',
      stockMin: '',
      stockMax: '',
    }),
    precioMin: '',
    precioMax: '',
    proveedor: '',
    ...(isCliente && { ordenar: 'precio' }),
    ...initialParams
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construir objeto de parámetros
    const params = { ...formData };
    
    // Eliminar campos vacíos
    Object.keys(params).forEach(key => {
      if (params[key] === '') delete params[key];
    });
    
    // Convertir listas a arrays
    if (params.modelos) params.modelos = params.modelos.split(',');
    if (params.nombres) params.nombres = params.nombres.split(',');
    
    onSearch(params);
  };

  const handleReset = () => {
    setFormData({
      q: '',
      ...(type === 'auto' ? { 
        modelo: '',
        modeloExacto: '',
        modelos: '',
        anioMin: '',
        anioMax: '',
      } : {
        nombre: '',
        nombreExacto: '',
        nombres: '',
        stockMin: '',
        stockMax: '',
      }),
      precioMin: '',
      precioMax: '',
      proveedor: '',
      ...(isCliente && { ordenar: 'precio' })
    });
    onSearch({});
  };

  return (
    <Form onSubmit={handleSubmit} className="border p-3 rounded-3 mb-4 bg-light">
      <Accordion defaultActiveKey="0">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <FaFilter className="me-2" /> Filtros de Búsqueda
          </Accordion.Header>
          <Accordion.Body>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="q">
                  <Form.Label>Búsqueda General</Form.Label>
                  <Form.Control
                    type="text"
                    name="q"
                    value={formData.q}
                    onChange={handleChange}
                    placeholder="Buscar por palabras clave..."
                  />
                  <Form.Text className="text-muted">
                    Búsqueda en todos los campos (mínimo 3 caracteres)
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group controlId="proveedor">
                  <Form.Label>Proveedor</Form.Label>
                  <Form.Control
                    type="text"
                    name="proveedor"
                    value={formData.proveedor}
                    onChange={handleChange}
                    placeholder="ID del proveedor"
                  />
                </Form.Group>
              </Col>
              
              {type === 'auto' ? (
                <>
                  <Col md={4}>
                    <Form.Group controlId="modelo">
                      <Form.Label>Modelo</Form.Label>
                      <Form.Control
                        type="text"
                        name="modelo"
                        value={formData.modelo}
                        onChange={handleChange}
                        placeholder="Buscar modelos..."
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group controlId="modeloExacto">
                      <Form.Label>Modelo Exacto</Form.Label>
                      <Form.Control
                        type="text"
                        name="modeloExacto"
                        value={formData.modeloExacto}
                        onChange={handleChange}
                        placeholder="Modelo exacto..."
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group controlId="modelos">
                      <Form.Label>Múltiples Modelos</Form.Label>
                      <Form.Control
                        type="text"
                        name="modelos"
                        value={formData.modelos}
                        onChange={handleChange}
                        placeholder="Modelo1,Modelo2,Modelo3"
                      />
                      <Form.Text className="text-muted">
                        Separados por comas
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group controlId="anioMin">
                      <Form.Label>Año Mínimo</Form.Label>
                      <Form.Control
                        type="number"
                        name="anioMin"
                        value={formData.anioMin}
                        onChange={handleChange}
                        min="1886"
                        max={new Date().getFullYear() + 1}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group controlId="anioMax">
                      <Form.Label>Año Máximo</Form.Label>
                      <Form.Control
                        type="number"
                        name="anioMax"
                        value={formData.anioMax}
                        onChange={handleChange}
                        min="1886"
                        max={new Date().getFullYear() + 1}
                      />
                    </Form.Group>
                  </Col>
                </>
              ) : (
                <>
                  <Col md={4}>
                    <Form.Group controlId="nombre">
                      <Form.Label>Nombre</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Buscar piezas..."
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group controlId="nombreExacto">
                      <Form.Label>Nombre Exacto</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombreExacto"
                        value={formData.nombreExacto}
                        onChange={handleChange}
                        placeholder="Nombre exacto..."
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={4}>
                    <Form.Group controlId="nombres">
                      <Form.Label>Múltiples Nombres</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombres"
                        value={formData.nombres}
                        onChange={handleChange}
                        placeholder="Pieza1,Pieza2,Pieza3"
                      />
                      <Form.Text className="text-muted">
                        Separados por comas
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group controlId="stockMin">
                      <Form.Label>Stock Mínimo</Form.Label>
                      <Form.Control
                        type="number"
                        name="stockMin"
                        value={formData.stockMin}
                        onChange={handleChange}
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group controlId="stockMax">
                      <Form.Label>Stock Máximo</Form.Label>
                      <Form.Control
                        type="number"
                        name="stockMax"
                        value={formData.stockMax}
                        onChange={handleChange}
                        min="0"
                      />
                    </Form.Group>
                  </Col>
                </>
              )}
              
              <Col md={6}>
                <Form.Group controlId="precioMin">
                  <Form.Label>Precio Mínimo</Form.Label>
                  <Form.Control
                    type="number"
                    name="precioMin"
                    value={formData.precioMin}
                    onChange={handleChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group controlId="precioMax">
                  <Form.Label>Precio Máximo</Form.Label>
                  <Form.Control
                    type="number"
                    name="precioMax"
                    value={formData.precioMax}
                    onChange={handleChange}
                    min="0"
                  />
                </Form.Group>
              </Col>
              
              {isCliente && (
                <Col md={12}>
                  <Form.Group controlId="ordenar">
                    <Form.Label>Ordenar por</Form.Label>
                    <Form.Select
                      name="ordenar"
                      value={formData.ordenar}
                      onChange={handleChange}
                    >
                      <option value="precio">Precio (Menor a Mayor)</option>
                      <option value="-precio">Precio (Mayor a Menor)</option>
                      <option value="nombre">Nombre (A-Z)</option>
                      <option value="-nombre">Nombre (Z-A)</option>
                      <option value="anio">Año (Más antiguo)</option>
                      <option value="-anio">Año (Más reciente)</option>
                      <option value="stock">Stock (Menor a Mayor)</option>
                      <option value="-stock">Stock (Mayor a Menor)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      
      <div className="d-flex justify-content-end mt-3 gap-2">
        <Button variant="outline-secondary" onClick={handleReset}>
          <FaUndo className="me-2" /> Limpiar
        </Button>
        <Button variant="primary" type="submit">
          <FaSearch className="me-2" /> Buscar
        </Button>
      </div>
    </Form>
  );
};

export default AdvancedSearch;