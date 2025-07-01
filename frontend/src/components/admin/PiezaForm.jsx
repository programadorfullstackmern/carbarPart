import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAdmin } from '../../context/AdminContext';

const PiezaForm = ({ pieza, onClose }) => {
  const { createPieza, updatePieza } = useAdmin();
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: '',
    precio: 0,
    stock: 0,
    descripcion: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (pieza) {
      setFormData({
        nombre: pieza.nombre || '',
        categoria: pieza.categoria || '',
        precio: pieza.precio || 0,
        stock: pieza.stock || 0,
        descripcion: pieza.descripcion || ''
      });
    }
  }, [pieza]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (pieza) {
        await updatePieza(pieza._id, formData);
      } else {
        await createPieza(formData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al guardar pieza');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Pieza guardada correctamente!</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Nombre</Form.Label>
        <Form.Control
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Categoría</Form.Label>
        <Form.Control
          type="text"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Precio ($)</Form.Label>
            <Form.Control
              type="number"
              name="precio"
              min="0"
              step="0.01"
              value={formData.precio}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Stock</Form.Label>
            <Form.Control
              type="number"
              name="stock"
              min="0"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Descripción</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="descripcion"
          value={formData.descripcion}
          onChange={handleChange}
        />
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="secondary" onClick={onClose} className="me-2">
          Cancelar
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Guardar'}
        </Button>
      </div>
    </Form>
  );
};

export default PiezaForm;