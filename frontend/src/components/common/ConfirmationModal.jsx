import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const ConfirmationModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  title, 
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  size = "md"
}) => {
  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      size={size}
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="lead">{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;