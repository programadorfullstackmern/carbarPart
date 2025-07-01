import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

const CartSummary = ({ items, subtotal, onCheckout }) => {
  const shipping = 0; // Envío gratuito
  const tax = subtotal * 0.1; // 10% de impuestos
  const total = subtotal + shipping + tax;

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-light">
        <h5 className="mb-0">Resumen del Pedido</h5>
      </Card.Header>
      
      <ListGroup variant="flush">
        <ListGroup.Item className="d-flex justify-content-between">
          <span>Subtotal ({items.length} items)</span>
          <span>${subtotal.toLocaleString()}</span>
        </ListGroup.Item>
        
        <ListGroup.Item className="d-flex justify-content-between">
          <span>Envío</span>
          <span>${shipping.toLocaleString()}</span>
        </ListGroup.Item>
        
        <ListGroup.Item className="d-flex justify-content-between">
          <span>Impuestos (10%)</span>
          <span>${tax.toLocaleString()}</span>
        </ListGroup.Item>
        
        <ListGroup.Item className="d-flex justify-content-between fw-bold fs-5">
          <span>Total</span>
          <span>${total.toLocaleString()}</span>
        </ListGroup.Item>
      </ListGroup>
      
      <Card.Body>
        <Button 
          variant="primary" 
          size="lg" 
          className="w-100 mt-3"
          onClick={onCheckout}
          disabled={items.length === 0}
        >
          Proceder al Pago
        </Button>
      </Card.Body>
    </Card>
  );
};

export default CartSummary;