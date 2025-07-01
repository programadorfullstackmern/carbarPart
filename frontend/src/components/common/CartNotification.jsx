import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

const CartNotification = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className: '',
        style: {
          border: '1px solid #713200',
          padding: '16px',
          color: '#713200',
          minWidth: '300px',
        },
        success: {
          style: {
            background: '#4BB543',
            color: 'white',
          },
        },
        error: {
          style: {
            background: '#FF0033',
            color: 'white',
          },
        },
      }}
    />
  );
};

export default CartNotification;