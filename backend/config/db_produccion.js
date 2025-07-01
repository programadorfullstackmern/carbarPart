import mongoose from 'mongoose';

//--------------------------Con Transacciones (Replica Set/Atlas)--------------------------
//Produccion
const connectDB_Produccion = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_PRODUCCION);
    console.log('MongoDB conectado');
  } catch (error) {
    console.error('Error de conexión a MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB_Produccion;