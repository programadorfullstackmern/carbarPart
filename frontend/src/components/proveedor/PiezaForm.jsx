import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert, FloatingLabel, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';
import ImageUploader from '../common/ImageUploader';

const PiezaForm = ({ 
  show, 
  onHide, 
  pieza, 
  onSuccess,
  onCreate,
  onUpdate
}) => {
  const [formValues, setFormValues] = useState({
    nombre: '',
    descripcion: '',
    stock: '',
    precio: ''
  });
  
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pieza) {
      setFormValues({
        nombre: pieza.nombre,
        descripcion: pieza.descripcion || '',
        stock: pieza.stock.toString(),
        precio: pieza.precio.toString()
      });
      setExistingImages(pieza.imagenes || []);
    } else {
      resetForm();
    }
  }, [pieza]);

  const resetForm = () => {
    setFormValues({ nombre: '', descripcion: '', stock: '', precio: '' });
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
    if (!formValues.nombre.trim()) {
      setError('El nombre es obligatorio');
      return false;
    }
    
    const stock = parseInt(formValues.stock);
    if (isNaN(stock) || stock < 0) {
      setError('El stock debe ser un número positivo');
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
      
      formData.append('nombre', formValues.nombre);
      formData.append('descripcion', formValues.descripcion);
      formData.append('stock', formValues.stock);
      formData.append('precio', formValues.precio);
      
      formData.append('existingImagenes', JSON.stringify(existingImages));
      formData.append('imagenesEliminar', JSON.stringify(imagesToDelete));
      newFiles.forEach(file => formData.append('imagenes', file));

      if (pieza) {
        await onUpdate(pieza._id, formData);
      } else {
        await onCreate(formData);
      }
      
      onSuccess();
      onHide();
      resetForm();
    } catch (err) {
      setError(err.message || 'Error al guardar la pieza');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{pieza ? 'Editar Pieza' : 'Nueva Pieza'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <FloatingLabel controlId="nombre" label="Nombre" className="mb-3">
            <Form.Control
              type="text"
              name="nombre"
              value={formValues.nombre}
              onChange={handleChange}
              placeholder="Filtro de aire"
              required
              maxLength={100}
            />
          </FloatingLabel>
          
          <FloatingLabel controlId="descripcion" label="Descripción" className="mb-3">
            <Form.Control
              as="textarea"
              name="descripcion"
              value={formValues.descripcion}
              onChange={handleChange}
              placeholder="Descripción detallada de la pieza..."
              style={{ height: '100px' }}
              maxLength={500}
            />
          </FloatingLabel>
          
          <Row className="g-3 mb-3">
            <Col md={6}>
              <FloatingLabel controlId="stock" label="Stock disponible">
                <Form.Control
                  type="number"
                  name="stock"
                  value={formValues.stock}
                  onChange={handleChange}
                  placeholder="100"
                  required
                  min="0"
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
                  placeholder="25.99"
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
                {pieza ? 'Actualizando...' : 'Creando...'}
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                {pieza ? 'Actualizar Pieza' : 'Crear Pieza'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PiezaForm;