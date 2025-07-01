import mongoose from 'mongoose';
import Auto from './Auto.js';
import Pieza from './Pieza.js';

const userSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido'],
    index: true,
  },
  password: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: 6,
    maxlength: 100,
    select: false,
  },
  rol: {
    type: String,
    enum: ['admin', 'proveedor', 'cliente'],
    required: true,
    index: true,
  },
  // Nuevos campos agregados
  telefono: {
    type: String,
    trim: true,
    match: [/^[0-9\s+\-()]{7,20}$/, 'Formato de teléfono inválido'],
  },
  direccion: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  tokenValidoDesde: {
    type: Date,
    default: Date.now
  },
  activo: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Eliminación en cascada actualizada (para proveedores)
userSchema.pre('deleteOne', async function (next) {
  const userId = this.getQuery()._id;
  const user = await mongoose.model('User').findById(userId);

  if (user.rol === 'proveedor') {
    await Auto.deleteMany({ proveedor: userId });
    await Pieza.deleteMany({ proveedor: userId });
  }
  next();
});

export default mongoose.model('User', userSchema);