import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
//import connectDB from './config/db.js';
//import connectDB_Desarrollo from './config/db_desarrollo.js';
import connectDB_Produccion from './config/db_produccion.js';
import cloudinary from './config/cloudinary.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { configureServer } from './config/serverConfig.js';

// Importar todas las rutas
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import autoRoutes from './routes/autoRoutes.js';
import piezaRoutes from './routes/piezaRoutes.js';
import carritoRoutes from './routes/carritoRoutes.js';
import ordenRoutes from './routes/ordenRoutes.js';
import proveedorRoutes from './routes/proveedorRoutes.js';


dotenv.config();
const app = express();

configureServer(app);

// Middlewares base
// Configura CORS para producción/desarrollo
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://frontCarbarPart.onrender.com' 
    : 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Conexiones
//connectDB();  // MongoDB Basico (Sin transacciones)
//connectDB_Desarrollo();  // MongoDB Desarrollo (Con transacciones)
connectDB_Produccion();  // MongoDB Produccion (Con transacciones)
cloudinary;    // Cloudinary

// ---------------------------------------------------------Rutas principales----------------------------------------------------------------
app.get('/api', (req, res) => {
  res.json({
    message: 'API de CarBar & Parts',
    roles_endpoints: {
      administrador: {
          login: 'Metodo: POST -- Endpoint: /api/auth/login -- Descripcion: Login (JWT para todos los roles) -- Permisos: Publico',
          registrarUsuario: 'Metodo: POST -- Endpoint: /api/admin/registro -- Descripcion: Registrar nuevo usuario con (rol proveedor o cliente y no administrador) -- Permisos: admin',
          editarUsuario: 'Metodo: PUT -- Endpoint: /api/admin/usuarios/:usuarioId -- Descripcion: Editar cualquier usuario -- Permisos: admin', 
          eliminarUsuario: 'Metodo: DELETE -- Endpoint: /api/admin/usuarios/:usuarioId -- Descripcion: Eliminar usuario (excepto admins) -- Permisos: admin',
          verPerfilPropio: 'Metodo: GET -- Endpoint: /api/auth/perfil -- Descripcion: Ver perfil propio segun Token -- Permisos: Cualquier usuario autenticado',
          verPerfilOtro: 'Metodo: GET -- Endpoint: /api/admin/usuarios/:usuarioOtroId -- Descripcion: Ver perfil de cualquier usuario -- Permisos: admin',
          listarUsuarios: 'Metodo: GET -- Endpoint: /api/admin/usuarios -- Descripcion: Listar todos los usuarios (sin passwords) -- Permisos: admin',
          listarClientes: 'Metodo: GET -- Endpoint: /api/admin/usuarios/clientes -- Descripcion: Listar todos los clientes (sin passwords) -- Permisos: admin'  ,
          listarProveedores: 'Metodo: GET -- Endpoint: /api/admin/usuarios/proveedores -- Descripcion: Listar todos los proveedores (sin passwords) -- Permisos: admin',          
          listarAutosProveedor: 'Metodo: GET -- Endpoint: /api/proveedores/:proveedorId/autos -- Descripcion: Listar todos los autos de un proveedor -- Permisos: admin',
          listarPiezasProveedor: 'Metodo: GET -- Endpoint: /api/proveedores/:proveedorId/piezas -- Descripcion: Listar todas las piezas de un proveedor -- Permisos: admin', 
          listarTodosAutos: 'Metodo: GET -- Endpoint: /api/autos/todos -- Descripcion: Listar todos los autos -- Permisos: admin', 
          listarTodosPiezas: 'Metodo: GET -- Endpoint: /api/piezas/todas -- Descripcion: Listar todas las piezas  -- Permisos: admin',
          listarOrdenEspecifica: 'Metodo: GET -- Endpoint: /api/ordenes/:ordenId -- Descripcion: Listar orden por el id de la Orden -- Permisos: admin', 
          listarOrdenes: 'Metodo: GET -- Endpoint: /api/ordenes/admin -- Descripcion: Listar todas las ordenes -- Permisos: admin', 
          ActualizarEstadoOrden: 'Metodo: PATCH -- Endpoint: /api/ordenes/:ordenId/estado -- Descripcion: Actualizar el estado de la orden -- Permisos: admin', 
          listarOrdenSegunEstado: 'Metodo: GET -- Endpoint: /api/ordenes/admin?estado=e -- Descripcion: Listar las ordenes segun el estado (pendiente, procesando, enviada, entregada, cancelada) -- Permisos: admin', 
          listarCarritos: 'Metodo: GET -- Endpoint: /api/carrito/admin/carritos -- Descripcion: Listar todos los carritos -- Permisos: admin'
      },
      proveedor: {
          login: 'Metodo: POST -- Endpoint: /api/auth/login -- Descripcion: Login (JWT para todos los roles) -- Permisos: Publico',
          crearAuto: 'Metodo: POST -- Endpoint: /api/autos -- Descripcion: Crear auto (+ imágenes) -- Permisos: proveedor',
          editarAuto: 'Metodo: PUT -- Endpoint: /api/autos/:autoId -- Descripcion: Editar auto -- Permisos: proveedor (dueño)', 
          eliminarAuto: 'Metodo: DELETE -- Endpoint: /api/autos/:autoId -- Descripcion: Eliminar auto -- Permisos: proveedor (dueño)',
          crearPieza: 'Metodo: POST -- Endpoint: /api/piezas -- Descripcion: Crear pieza (+ imágenes)	-- Permisos: proveedor',
          editarPieza: 'Metodo: PUT -- Endpoint: /api/piezas/:piezaId -- Descripcion: Editar pieza -- Permisos: proveedor (dueño)', 
          eliminarPieza: 'Metodo: DELETE -- Endpoint: /api/piezas/:piezaId -- Descripcion: Eliminar pieza -- Permisos: proveedor (dueño)',
          listarPiezasDeAuto: 'Metodo: GET -- Endpoint: /api/autos/:autoId/piezas -- Descripcion: Listar las piezas compatibles a un auto -- Permisos: admin',
          listarAutosDePiezas: 'Metodo: GET -- Endpoint: /api/piezas/:piezaId/autos -- Descripcion: Listar los autos compatibles a una pieza -- Permisos: admin',
          listarAutosDeProveedorAutenticado: 'Metodo: GET -- Endpoint: /api/proveedores/autos -- Descripcion: Listar todos los autos del proveedor autenticado -- Permisos: admin',
          listarPiezasDeProveedorAutenticado: 'Metodo: GET -- Endpoint: /api/proveedores/piezas -- Descripcion: Listar todas las piezas del proveedor autenticado -- Permisos: admin',
          vincularAuto: 'Metodo: POST -- Endpoint: /api/piezas/:piezaId/vincular-auto/:autoId -- Descripcion: Vincular auto a pieza -- Permisos: proveedor (dueño)',
          vincularPieza: 'Metodo: POST -- Endpoint: /api/autos/:autoId/vincular-pieza/:piezaId -- Descripcion: Vincular pieza a auto -- Permisos: proveedor (dueño)',
          DesvincularAuto: 'Metodo: DELETE -- Endpoint: /api/piezas/:piezaId/desvincular-auto/:autoId -- Descripcion: Desvincular auto de pieza -- Permisos: proveedor (dueño)',
          DesvincularPieza: 'Metodo: DELETE -- Endpoint: /api/autos/:autoId/desvincular-pieza/:piezaId -- Descripcion: Desvincular pieza de auto -- Permisos: proveedor (dueño)',
          verPerfilPropio: 'Metodo: GET -- Endpoint: /api/auth/perfil -- Descripcion: Ver perfil propio segun Token -- Permisos: Cualquier usuario autenticado'           
      },
      cliente: {
          login: 'Metodo: POST -- Endpoint: /api/auth/login -- Descripcion: Login (JWT para todos los roles) -- Permisos: Publico',         
          actualizarCarrito: 'Metodo: PUT -- Endpoint: /api/carrito -- Descripcion: Actualizar carrito -- Permisos: cliente',
          verCarrito: 'Metodo: GET -- Endpoint: /api/carrito -- Descripcion: Ver carrito de cliente autenticado -- Permisos: cliente',
          eliminarItemCarrito: 'Metodo: DELETE -- Endpoint: /api/carrito/items -- Descripcion: Eliminar item de carrito especifico -- Permisos: cliente',
          vaciarCarrito: 'Metodo: DELETE -- Endpoint: /api/carrito -- Descripcion: vaciar carrito de cliente autenticado -- Permisos: cliente',
          verificarStock: 'Metodo: POST -- Endpoint: /api/carrito/verificar-stock -- Descripcion: Verificar stock de producto -- Permisos: cliente',
          crearOrden: 'Metodo: POST -- Endpoint: /api/ordenes -- Descripcion: Crear orden desde carrito -- Permisos: cliente',
          historialCompras: 'Metodo: GET -- Endpoint: /api/ordenes -- Descripcion: Historial de compras -- Permisos: cliente',
          obtenerOrdenDeclienteAutenticado: 'Metodo: GET -- Endpoint: /api/ordenes/:ordenId -- Descripcion: Obtener orden del cliente   -- Permisos: cliente (dueño)',
          verPerfilPropio: 'Metodo: GET -- Endpoint: /api/auth/perfil -- Descripcion: Ver perfil propio segun Token -- Permisos: Cualquier usuario autenticado',
          busqueda: {
              aproximadoModelo: 'Metodo: GET -- Endpoint: /api/autos?modelo=m -- Descripcion: Buscar autos por modelo aproximado -- Permisos: cliente',
              aproximadoNombre: 'Metodo: GET -- Endpoint: /api/piezas?nombre=p -- Descripcion: Buscar piezas por nombre aproximado -- Permisos: cliente',
              combinacionMultipleAutos: 'Metodo: GET -- Endpoint: /api/autos?modelo=Peugeot&anioMin=2015&precioMax=150000 -- Descripcion: Buscar autos por combinacion de parametros -- Permisos: cliente',
              combinacionMultiplePiezas: 'Metodo: GET -- Endpoint: /api/piezas?q=Frenos&stockMin=4 -- Descripcion: Buscar piezas por combinacion de parametros -- Permisos: cliente',  
              fraseExactaModelo: 'Metodo: GET -- Endpoint: /api/autos?modeloExacto=Peugeot -- Descripcion: Buscar auto por modelo exacto -- Permisos: cliente',
              fraseExactaNombre: 'Metodo: GET -- Endpoint: /api/piezas?nombreExacto=Frenos -- Descripcion: Buscar pieza por nombre exacto -- Permisos: cliente',
              fullTextAutos: 'Metodo: GET -- Endpoint: /api/autos?q=peugeot -- Descripcion: Buscar auto por texto en mayuscula o minuscula -- Permisos: cliente',
              fullTextPiezas: 'Metodo: GET -- Endpoint: /api/piezas?q=parabrisas -- Descripcion: Buscar pieza por texto en mayuscula o minuscula -- Permisos: cliente',
              fullTextyfiltrosAutos: 'Metodo: GET -- Endpoint: /api/autos?q=Toyota&anioMin=2015&precioMax=20000 -- Descripcion: Buscar auto combinando texto con parametros -- Permisos: cliente', 
              fullTextyfiltrosPiezas: 'Metodo: GET -- Endpoint: /api/piezas?stockMin=3&precioMax=200000 -- Descripcion: Buscar pieza combinando texto con parametros -- Permisos: cliente',
              listaModelos: 'Metodo: GET -- Endpoint: /api/autos?modelos=Peugeot, Almendron -- Descripcion: Buscar auto por lista de modelos -- Permisos: cliente',
              listaNombres: 'Metodo: GET -- Endpoint: /api/piezas?nombres=Frenos, ParaBrisas -- Descripcion: Buscar pieza por lista de nombres -- Permisos: cliente',
              paginacionyOrdenamientoAutos: 'Metodo: GET -- Endpoint: /api/autos?sort=-precio,modelo&pagina=2&limite=5 -- Descripcion: Buscar autos usando paginacion y ordenamiento -- Permisos: cliente',
              paginacionyOrdenamientoPiezas: 'Metodo: GET -- Endpoint: /api/piezas?sort=nombre&pagina=3&limite=15 -- Descripcion: Buscar piezas usando paginacion y ordenamiento -- Permisos: cliente',
              proveedorAutos: 'Metodo: GET -- Endpoint: /api/autos?proveedor=:proveedorID -- Descripcion: Buscar autos de un proveedor especifico -- Permisos: cliente',
              proveedorPiezas: 'Metodo: GET -- Endpoint: /api/piezas?proveedor=proveedorID -- Descripcion: Buscar piezas de un proveedor especifico -- Permisos: cliente',
              rangosAnosAutos: 'Metodo: GET -- Endpoint: /api/autos?anioMin=2015&anioMax=2020 -- Descripcion: Buscar autos por rango de Año -- Permisos: cliente',
              rangosPreciosAutos: 'Metodo: GET -- Endpoint: /api/autos?precioMin=5000&precioMax=15000 -- Descripcion: Buscar autos por rango de precios -- Permisos: cliente',
              rangosPreciosPiezas: 'Metodo: GET -- Endpoint: /api/piezas?precioMin=50000&precioMax=200000 -- Descripcion: Buscar piezas por rango de precios -- Permisos: cliente',
              rangosStockPiezas: 'Metodo: GET -- Endpoint: /api/piezas?stockMin=1&stockMax=8 -- Descripcion: Buscar piezas por rango de stock -- Permisos: cliente',
              piezasCompatibles: 'Metodo: GET -- Endpoint: /api/autos?piezasCompatibles=:autoId,:piezaId -- Descripcion: Buscar piezas compatibles con un auto -- Permisos: cliente',
              autosCompatibles: 'Metodo: GET -- Endpoint: /api/piezas?autosCompatibles=:piezaId,:autoId -- Descripcion: Buscar autos compatibles con una pieza -- Permisos: cliente'
          }
        }
      }
  });
});
// ------------------------------------------------------------------Rutas principales----------------------------------------------------------------

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/autos', autoRoutes);
app.use('/api/piezas', piezaRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/ordenes', ordenRoutes);
app.use('/api/proveedores', proveedorRoutes);

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
}).setTimeout(60 * 1000); // 60 segundos;