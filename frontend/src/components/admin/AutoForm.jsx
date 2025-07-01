import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAdmin } from '../../context/AdminContext';

const AutoForm = ({ auto, onClose }) => {
  const { createAuto, updateAuto } = useAdmin();
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    anio: new Date().getFullYear(),
    precio: 0,
    descripcion: '',
    disponible: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (auto) {
      setFormData({
        marca: auto.marca || '',
        modelo: auto.modelo || '',
        anio: auto.anio || new Date().getFullYear(),
        precio: auto.precio || 0,
        descripcion: auto.descripcion || '',
        disponible: auto.disponible !== undefined ? auto.disponible : true
      });
    }
  }, [auto]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (auto) {
        await updateAuto(auto._id, formData);
      } else {
        await createAuto(formData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al guardar auto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">Auto guardado correctamente!</Alert>}

      <Form.Group className="mb-3">
        <Form.Label>Marca</Form.Label>
        <Form.Control
          type="text"
          name="marca"
          value={formData.marca}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Modelo</Form.Label>
        <Form.Control
          type="text"
          name="modelo"
          value={formData.modelo}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Año</Form.Label>
            <Form.Control
              type="number"
              name="anio"
              min="1900"
              max={new Date().getFullYear() + 1}
              value={formData.anio}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
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

      <Form.Group className="mb-3">
        <Form.Check 
          type="switch"
          id="available-switch"
          label="Disponible"
          name="disponible"
          checked={formData.disponible}
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

export default AutoForm;