// src/components/common/ImageUploader.jsx
import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Image, Form } from 'react-bootstrap';
import { FaTrash, FaUpload } from 'react-icons/fa';

const ImageUploader = ({ 
  existingImages = [],   // Imágenes ya subidas a Cloudinary
  onNewFilesSelected,    // Callback para nuevos archivos seleccionados
  onDeleteExistingImage, // Callback para eliminar imagen existente
  onDeleteNewImage       // Callback para eliminar imagen nueva
}) => {
  const [previewUrls, setPreviewUrls] = useState([]);

  // Limpiar URLs temporales al desmontar
  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [previewUrls]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Generar URLs para previsualización
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviews]);

    // Notificar al componente padre
    onNewFilesSelected(files);
  };

  const removeExisting = (publicId) => {
    onDeleteExistingImage(publicId);
  };

  const removeNew = (index) => {
    // Revocar URL temporal
    URL.revokeObjectURL(previewUrls[index]);
    
    // Actualizar estado de previsualización
    const newPreviews = [...previewUrls];
    newPreviews.splice(index, 1);
    setPreviewUrls(newPreviews);

    // Notificar al componente padre
    onDeleteNewImage(index);
  };

  return (
    <Form.Group className="mb-4">
      <Form.Label>Imágenes del Producto</Form.Label>
      
      <Row className="g-3">
        {/* Imágenes existentes */}
        {existingImages.map((img) => (
          <Col xs={4} key={img.public_id}>
            <div className="position-relative">
              <Image 
                src={img.url} 
                thumbnail 
                className="img-fluid"
                style={{ height: '120px', objectFit: 'cover' }}
              />
              <Button
                variant="danger"
                size="sm"
                className="position-absolute top-0 end-0 m-1"
                onClick={() => removeExisting(img.public_id)}
              >
                <FaTrash />
              </Button>
            </div>
          </Col>
        ))}

        {/* Previsualización de nuevas imágenes */}
        {previewUrls.map((url, index) => (
          <Col xs={4} key={`preview-${index}`}>
            <div className="position-relative">
              <Image 
                src={url} 
                thumbnail 
                className="img-fluid"
                style={{ height: '120px', objectFit: 'cover' }}
              />
              <Button
                variant="danger"
                size="sm"
                className="position-absolute top-0 end-0 m-1"
                onClick={() => removeNew(index)}
              >
                <FaTrash />
              </Button>
            </div>
          </Col>
        ))}
        
        {/* Input para subir nuevas imágenes */}
        <Col xs={4}>
          <div className="border rounded d-flex align-items-center justify-content-center h-100">
            <Form.Label htmlFor="image-upload" className="m-0 p-4 text-center cursor-pointer">
              <FaUpload size={24} />
              <p className="mb-0 mt-2">Agregar imagen</p>
              <Form.Control
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="d-none"
              />
            </Form.Label>
          </div>
        </Col>
      </Row>
    </Form.Group>
  );
};

export default ImageUploader;