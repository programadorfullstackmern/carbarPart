import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const autoSchema = new mongoose.Schema({
  modelo: {
    type: String,
    required: [true, 'El modelo es obligatorio'],
    trim: true,
    minlength: [2, 'Mínimo 2 caracteres para el modelo'],
    maxlength: [50, 'Máximo 50 caracteres para el modelo'],
    index: true,
  },
  anio: {
    type: Number,
    required: [true, 'El año es requerido'],
    min: [1886, 'El primer auto fue fabricado en 1886'],
    max: [new Date().getFullYear() + 1, 'No se pueden registrar autos del futuro'],
    validate: {
      validator: Number.isInteger,
      message: 'El año debe ser un número entero'
    }
  },
  proveedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  piezasCompatibles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pieza',
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v) && 
               mongoose.isValidObjectId(v);
      },
      message: 'ID de pieza inválido'
    }
  }],
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

// Reemplazar el índice de texto existente
autoSchema.index({
  modelo: 'text',
  descripcion: 'text'  // Agregar descripción si existe
}, {
  weights: {
    modelo: 5,
    descripcion: 2
  },
  name: 'auto_text_index',
  default_language: 'spanish',
  collation: { locale: 'es', strength: 1 }  // Búsqueda insensible a acentos
});


autoSchema.plugin(mongoosePaginate);

export default mongoose.model('Auto', autoSchema);