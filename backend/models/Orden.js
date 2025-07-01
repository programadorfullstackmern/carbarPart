import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const ordenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'items.tipoProducto',
      required: true,
    },
    tipoProducto: {
      type: String,
      enum: ['Auto', 'Pieza'],
      required: true,
    },
    cantidad: Number,
    precioUnitario: Number,
    // Campos redundantes añadidos
    nombreProducto: String,
    imagenProducto: String,
    sku: String,
    proveedor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  total: {
    type: Number,
    required: true,
  },
  estado: {
    type: String,
    enum: ['pendiente', 'procesando', 'enviada', 'entregada', 'cancelada'],
    default: 'pendiente',
  },
  direccionEntrega: {
    nombre: String,
    direccion: String,
    ciudad: String,
    telefono: String,
  },
  metodoPago: {
    type: String,
    required: true,
  },
  numeroPedido: {
    type: String,
    unique: true,
  },
}, { timestamps: true });

ordenSchema.plugin(mongoosePaginate);

// Índices
ordenSchema.index({ user: 1 });
ordenSchema.index({ createdAt: -1 });
ordenSchema.index({ 'items.producto': 1 });

export default mongoose.model('Orden', ordenSchema);