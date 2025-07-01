import React from 'react';
import { Form } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { Button } from 'react-bootstrap';

const CartItem = ({ item, onRemove, onQuantityChange }) => {
  // Valores por defecto para propiedades faltantes
  const safeItem = {
    id: item?.id || 'unknown',
    name: item?.name || 'Producto sin nombre',
    price: item?.price || 0,
    type: item?.type || 'auto',
    image: item?.image || null,
    quantity: item?.quantity || 1
  };

  const { id, name, price, type, image, quantity } = safeItem;

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value);
    if (newQuantity >= 1) {
      onQuantityChange(newQuantity);
    }
  };

  return (
    <tr className="border-bottom">
      <td>
        <div className="d-flex align-items-center">
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className="img-fluid rounded me-3"
              style={{ width: '80px', height: '80px', objectFit: 'cover' }}
            />
          ) : (
            <div className="bg-light border rounded d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '80px', height: '80px' }}>
              <span className="text-muted">Sin imagen</span>
            </div>
          )}
          <div>
            <h6 className="mb-1 fw-bold">{name}</h6>
            <small className="text-muted d-block">{type === 'auto' ? 'Auto' : 'Pieza'}</small>
            <div className="fw-bold text-primary mt-1">
              ${price.toLocaleString()}
            </div>
          </div>
        </div>
      </td>
      <td className="align-middle">
        ${price.toLocaleString()}
      </td>
      <td className="align-middle">
        <Form.Group controlId={`quantity-${id}`}>
          <Form.Control
            type="number"
            min="1"
            value={quantity}
            onChange={handleQuantityChange}
            className="text-center"
            style={{ maxWidth: '100px' }}
            aria-label="Cantidad"
          />
        </Form.Group>
      </td>
      <td className="align-middle fw-bold">
        ${(price * quantity).toLocaleString()}
      </td>
      <td className="align-middle">
        <Button 
          variant="outline-danger" 
          size="sm"
          onClick={onRemove}
          aria-label="Eliminar"
        >
          <FaTrash />
        </Button>
      </td>
    </tr>
  );
};

export default CartItem;