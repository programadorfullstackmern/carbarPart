import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert, FloatingLabel, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';
import ImageUploader from '../common/ImageUploader';

const AutoForm = ({ 
  show, 
  onHide, 
  auto, 
  onSuccess,
  onCreate,
  onUpdate
}) => {
  const [formValues, setFormValues] = useState({
    modelo: '',
    anio: '',
    precio: ''
  });
  
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (auto) {
      setFormValues({
        modelo: auto.modelo,
        anio: auto.anio.toString(),
        precio: auto.precio.toString()
      });
      setExistingImages(auto.imagenes || []);
    } else {
      resetForm();
    }
  }, [auto]);

  const resetForm = () => {
    setFormValues({ modelo: '', anio: '', precio: '' });
    setExistingImages([]);
    setNewFiles([]);
    setImagesToDelete([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleNewFiles = (files) => {
    setNewFiles(prev => [...prev, ...files]);
  };

  const handleDeleteExisting = (publicId) => {
    setImagesToDelete(prev => [...prev, publicId]);
    setExistingImages(prev => prev.filter(img => img.public_id !== publicId));
  };

  const handleDeleteNew = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formValues.modelo.trim()) {
      setError('El modelo es obligatorio');
      return false;
    }
    
    const year = parseInt(formValues.anio);
    if (isNaN(year) || year < 1886 || year > new Date().getFullYear() + 1) {
      setError(`El año debe estar entre 1886 y ${new Date().getFullYear() + 1}`);
      return false;
    }
    
    const price = parseFloat(formValues.precio);
    if (isNaN(price) || price <= 0) {
      setError('El precio debe ser mayor que 0');
      return false;
    }
    
    if (existingImages.length + newFiles.length === 0) {
      setError('Debe agregar al menos una imagen');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      
      formData.append('modelo', formValues.modelo);
      formData.append('anio', formValues.anio);
      formData.append('precio', formValues.precio);
      
      formData.append('existingImagenes', JSON.stringify(existingImages));
      formData.append('imagenesEliminar', JSON.stringify(imagesToDelete));
      newFiles.forEach(file => formData.append('imagenes', file));

      if (auto) {
        await onUpdate(auto._id, formData);
      } else {
        await onCreate(formData);
      }
      
      onSuccess();
      onHide();
      resetForm();
    } catch (err) {
      setError(err.message || 'Error al guardar el auto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{auto ? 'Editar Auto' : 'Nuevo Auto'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <FloatingLabel controlId="modelo" label="Modelo" className="mb-3">
            <Form.Control
              type="text"
              name="modelo"
              value={formValues.modelo}
              onChange={handleChange}
              placeholder="Toyota Corolla"
              required
              maxLength={50}
            />
          </FloatingLabel>
          
          <Row className="g-3 mb-3">
            <Col md={6}>
              <FloatingLabel controlId="anio" label="Año">
                <Form.Control
                  type="number"
                  name="anio"
                  value={formValues.anio}
                  onChange={handleChange}
                  placeholder="2020"
                  required
                  min="1886"
                  max={new Date().getFullYear() + 1}
                />
              </FloatingLabel>
            </Col>
            <Col md={6}>
              <FloatingLabel controlId="precio" label="Precio (USD)">
                <Form.Control
                  type="number"
                  name="precio"
                  value={formValues.precio}
                  onChange={handleChange}
                  placeholder="25000"
                  required
                  min="0.01"
                  step="0.01"
                />
              </FloatingLabel>
            </Col>
          </Row>
          
          <h5 className="mt-4 mb-3">Imágenes</h5>
          <ImageUploader
            existingImages={existingImages}
            onNewFilesSelected={handleNewFiles}
            onDeleteExistingImage={handleDeleteExisting}
            onDeleteNewImage={handleDeleteNew}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {auto ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                {auto ? 'Actualizar Auto' : 'Crear Auto'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AutoForm;