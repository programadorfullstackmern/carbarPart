import mongoose from 'mongoose';

const carritoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'items.tipoProducto',
    },
    tipoProducto: {
      type: String,
      required: true,
      enum: ['Auto', 'Pieza'],
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },
    precioUnitario: {  // Nuevo campo
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model('Carrito', carritoSchema);