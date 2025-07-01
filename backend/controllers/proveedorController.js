// controllers/proveedorController.js
import { Auto, Pieza, Orden } from '../models/index.js';
import asyncHandler from 'express-async-handler';
import { HTTP_CODES, MENSAJES } from '../utils/constants.js';

const obtenerRecursosProveedor = (modelo, nombreModelo) => 
  asyncHandler(async (req, res) => {
    const { 
      pagina = 1, 
      limite = 20, 
      sort = '-createdAt',
      campos 
    } = req.query;

    const opciones = {
      page: pagina,
      limit: Math.min(limite, 100),
      sort: sort.split(',').join(' '),
      select: campos ? campos.split(',') : '-__v -proveedor',
      lean: true
    };

    const resultados = await modelo.paginate(
      { proveedor: req.user.id },
      opciones
    );

    res.status(HTTP_CODES.OK).json({
      success: true,
      cantidad: resultados.docs.length,
      datos: resultados.docs,
      paginacion: {
        total: resultados.totalDocs,
        paginas: resultados.totalPages,
        pagina: resultados.page,
        limite: resultados.limit
      },
      message: MENSAJES.EXITO[`${nombreModelo}_ENCONTRADOS`]
    });
  });

  // Nueva función genérica para ADMIN
const obtenerRecursosProveedorAdmin = (modelo, nombreModelo) => 
  asyncHandler(async (req, res) => {
    const { 
      pagina = 1, 
      limite = 20, 
      sort = '-createdAt',
      campos 
    } = req.query;

    const opciones = {
      page: pagina,
      limit: Math.min(limite, 100),
      sort: sort.split(',').join(' '),
      select: campos ? campos.split(',') : '-__v -proveedor',
      lean: true
    };

    // Usar proveedorId de los parámetros de ruta
    const { proveedorId } = req.params;

    const resultados = await modelo.paginate(
      { proveedor: proveedorId }, // Filtra por ID del proveedor solicitado
      opciones
    );

    res.status(HTTP_CODES.OK).json({
      success: true,
      cantidad: resultados.docs.length,
      datos: resultados.docs,
      paginacion: {
        total: resultados.totalDocs,
        paginas: resultados.totalPages,
        pagina: resultados.page,
        limite: resultados.limit
      },
      message: MENSAJES.EXITO[`${nombreModelo}_ENCONTRADOS`]
    });
  });

// Exportar funciones nuevas para ADMIN
export const obtenerAutosProveedor = obtenerRecursosProveedorAdmin(Auto, 'AUTOS');
export const obtenerPiezasProveedor = obtenerRecursosProveedorAdmin(Pieza, 'PIEZAS');

export const obtenerMisAutos = obtenerRecursosProveedor(Auto, 'AUTOS');
export const obtenerMisPiezas = obtenerRecursosProveedor(Pieza, 'PIEZAS');
export const obtenerMisOrdenes = obtenerRecursosProveedor(Orden, 'ORDENES');