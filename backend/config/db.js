import mongoose from 'mongoose';

//--------------------------Sin Transacciones--------------------------
//(Conexión básica)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_BASICA);
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
