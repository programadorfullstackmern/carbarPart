import React from 'react';
import { Badge } from 'react-bootstrap';
import { useCart } from '../../context/CartContext';

const CartCounter = () => {
  const { totalItems } = useCart();
  
  return (
    <>
      {totalItems > 0 && (
        <Badge 
          pill 
          bg="danger" 
          className="position-absolute"
          style={{ 
            fontSize: '0.65rem',
            top: '0',
            right: '0',
            transform: 'translate(25%, -25%)',
            minWidth: '18px',
            minHeight: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1'
          }}
        >
          {totalItems}
        </Badge>
      )}
    </>
  );
};

export default CartCounter;