import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from './models/index.js';
dotenv.config();

// 1. Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI_BASICA)
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error(err));

const crearAdmin = async () => {
  try {
    // Hashear correctamente con await y salt generado
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash("Admin123", salt); // <-- ¡Clave aquí!

    const admin = await User.create({
      nombre: "Admin Master",
      email: "admin@example.com",
      password: hashedPassword,
      rol: "admin"
    });

        // 3. Generar token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    console.log('✅ Admin creado:', admin);
    console.log('Token:', token);
    process.exit();
  } catch (error) {
    console.error('🚨 Error:', error.message);
    process.exit(1);
  }
};

crearAdmin();