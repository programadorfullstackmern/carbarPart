import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const piezaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    index: true
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'Máximo 500 caracteres para la descripción']
  },
  autosCompatibles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auto',
    validate: {
      validator: v => mongoose.Types.ObjectId.isValid(v) && 
                     mongoose.isValidObjectId(v),
      message: 'ID de auto inválido'
    }
  }],
  proveedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'El stock no puede ser negativo'],
    max: [1000000, 'Stock máximo excedido'],
    index: true
  },
  imagenes: [{
    url: {
      type: String,
      required: true,
      match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i, 'URL de imagen inválida']
    },
    public_id: {
      type: String,
      required: true,
      match: [/^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/, 'Public ID inválido']
    }
  }],
  precio: {
    type: Number,
    min: [0, 'El precio no puede ser negativo'],
    max: [10000000, 'Precio máximo excedido'],
    required: true,
    index: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

piezaSchema.index({
  nombre: 'text',
  descripcion: 'text',
  codigo: 'text'  // Agregar campo código si existe
}, {
  weights: {
    nombre: 5,
    descripcion: 2,
    codigo: 3
  },
  name: 'pieza_text_index',
  default_language: 'spanish',
  collation: { locale: 'es', strength: 1 }  // Búsqueda insensible a acentos
});

piezaSchema.plugin(mongoosePaginate);

export default mongoose.model('Pieza', piezaSchema);