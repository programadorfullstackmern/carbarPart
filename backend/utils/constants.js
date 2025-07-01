export const CONFIG = {
  IMAGENES: {
    MAX_FILE_SIZE_MB: 15,
    MAX_DIMENSION: 2500,
    TARGET_QUALITY: 80,
    MAX_IMAGENES: 5,
    ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
  },
  PRECIO: {
    MIN: 0,
    MAX: 10000000
  },
   PAGINACION: {
    MAX_STOCK: 1000000, // <-- Agregar esta línea
    LIMITE: 10,
    //...
  },
     PAGINACION_LIMITE: {
    MAX_LIMITE: 1000000, // <-- Agregar esta línea
    LIMITE: 10,
    //...
  },
  ANIO: {
    MIN: 1886,
    MAX: new Date().getFullYear() + 1
  },
  MODELO_LONGITUD: {
    MODELO_MIN: 2,
    MODELO_MAX: 50,
    PUBLIC_ID: 100
  },
    NOMBRE_LONGITUD: {
    NOMBRE_MIN: 2,
    NOMBRE_MAX: 50,
    PUBLIC_ID: 100
  },
    // Agregar configuración para búsquedas
  BUSQUEDA: {
    MIN_CARACTERES: 3,
    MAX_RESULTADOS: 1000
  }
};

export const MENSAJES = {
  ERROR: {
    // General
    ID_INVALIDO: "ID inválido",
    ACCION_NO_AUTORIZADA: "Acción no autorizada",
    RECURSO_NO_ENCONTRADO: "Recurso no encontrado",
    PROVEEDOR_ID_INVALIDO: "Id Proveedor invalido",
    PRECIO_INVALIDO: 'El precio debe ser un número mayor a 0',
   
    // Nuevos mensajes para búsquedas
    BUSQUEDA_CORTA: 'La búsqueda requiere al menos 3 caracteres',
    ORDEN_INVALIDO: 'Formato de ordenamiento inválido. Ejemplos válidos: "nombre", "-precio", "modelo,-anio"',
    PROVEEDOR_INVALIDO: 'ID de proveedor inválido',
    PIEZA_INVALIDA: 'ID de pieza inválido',
    AUTO_INVALIDO: 'ID de auto inválido',
    BUSQUEDA_ERROR: 'Error en búsqueda de recursos',
    LIMITE_INVALIDO: `El límite debe estar entre 1 y ${CONFIG.PAGINACION_LIMITE.MAX_LIMITE}`,
    PIEZAS_IDS_INVALIDOS: "Contiene IDs de pieza inválidos",
    AUTOS_IDS_INVALIDOS: "Contiene IDs de auto inválidos",
    MODELO_LONGITUD: `El modelo debe tener al menos ${CONFIG.MODELO_LONGITUD.MODELO_MIN} caracteres`,
    NOMBRE_LONGITUD: `El nombre debe tener al menos ${CONFIG.NOMBRE_LONGITUD.NOMBRE_MIN} caracteres`,
    
    // Imágenes
    FORMATO_IMAGEN: `Formatos permitidos: ${CONFIG.IMAGENES.ALLOWED_MIME_TYPES.join(', ')}`,
    TAMAÑO_IMAGEN: `Tamaño máximo por archivo: ${CONFIG.IMAGENES.MAX_FILE_SIZE_MB}MB`,
    MAX_IMAGENES: `Máximo ${CONFIG.IMAGENES.MAX_IMAGENES} imágenes permitidas`,
    IMAGENES_REQUERIDAS: "Se requiere al menos una imagen",
    IMAGEN_URL_INVALIDA: "URL de imagen inválida",
    IMAGEN_ID_INVALIDO: "Public ID de imagen inválido",
    IMAGENES_ELIMINAR_FORMATO: "Formato inválido para imágenes a eliminar",

    // Autos
    MODELO_REQUERIDO: "El modelo es obligatorio",
    MODELO_LONGITUD: `El modelo debe tener entre ${CONFIG.MODELO_LONGITUD.MODELO_MIN} y ${CONFIG.MODELO_LONGITUD.MODELO_MAX} caracteres`,
    ANIO_REQUERIDO: "El año es requerido",
    ANIO_FORMATO: "El año debe ser un número entero",
    ANIO_INVALIDO: `El año debe estar entre ${CONFIG.ANIO.MIN} y ${CONFIG.ANIO.MAX}`,
    PRECIO_INVALIDO: `El precio debe ser entre ${CONFIG.PRECIO.MIN} y ${CONFIG.PRECIO.MAX}`,
    
    // Piezas
    NOMBRE_REQUERIDO: "El nombre de la pieza es obligatorio",
    NOMBRE_LONGITUD: `El modelo debe tener entre ${CONFIG.NOMBRE_LONGITUD.NOMBRE_MIN} y ${CONFIG.NOMBRE_LONGITUD.NOMBRE_MAX} caracteres`,
    STOCK_INVALIDO: `Stock debe ser entre ${CONFIG.PRECIO.MIN} y 1,000,000`,
    PIEZAS_INVALIDAS: "Formato de piezas compatibles inválido",
    PIEZAS_IDS_INVALIDOS: "IDs de piezas inválidos detectados",
    AUTOS_INVALIDOS: "IDs de autos inválidos detectados",
    AUTOS_IDS_INVALIDOS: "IDs de autos compatibles inválidos",
    
    // DB
    DUPLICADO_ERROR: "Registro duplicado",
    VALIDACION_DB_ERROR: "Error de validación de datos"
  },
  EXITO: {
    // General
    ACTUALIZACION: "Actualización exitosa",
    ELIMINACION: "Eliminación exitosa",
    VINCULACION_EXITOSA: "Vinculación exitosa",
    DESVINCULACION_EXITOSA: 'Desvinculación realizada correctamente',
    
    // Autos
    AUTO_CREADO: "Auto creado exitosamente",
    AUTO_ACTUALIZADO: "Auto actualizado correctamente",
    AUTO_ELIMINADO: "Auto eliminado permanentemente",
    
    // Piezas
    PIEZA_CREADA: "Pieza creada correctamente",
    PIEZA_ACTUALIZADA: "Pieza actualizada exitosamente",
    PIEZA_ELIMINADA: "Pieza eliminado permanentemente",
    
    // Imágenes
    IMAGENES_ACTUALIZADAS: "Imágenes actualizadas correctamente"
  },
  ADVERTENCIAS: {
    IMAGENES_ELIMINADAS: "Imágenes eliminadas en segundo plano"
  }
};

export const HTTP_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
};