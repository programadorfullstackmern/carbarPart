import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import sharp from 'sharp';
import { CONFIG, MENSAJES } from '../utils/constants.js';

const { 
  MAX_FILE_SIZE_MB,
  MAX_DIMENSION,
  TARGET_QUALITY,
  ALLOWED_MIME_TYPES
} = CONFIG.IMAGENES;

// Configuración Multer
const configMulter = {
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    files: 5
  },
  fileFilter: (req, file, cb) => {
    ALLOWED_MIME_TYPES.includes(file.mimetype) 
      ? cb(null, true)
      : cb(new Error(MENSAJES.ERROR.FORMATO_IMAGEN), false);
  }
};

export const upload = multer(configMulter);

// Optimización de imágenes
const optimizarImagen = async (buffer) => {
  return sharp(buffer)
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .toFormat('webp', {
      quality: TARGET_QUALITY,
      alphaQuality: TARGET_QUALITY,
      effort: 4
    })
    .toBuffer();
};

// Subida a Cloudinary
export const uploadToCloudinary = (folder) => async (req, res, next) => {
  if (!req.files?.length) return next();

  try {
    req.uploadedFiles = [];
    
    for (const file of req.files) {
      const optimizedBuffer = await optimizarImagen(file.buffer);
      
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `${folder}`,
            timeout: 60000,
            quality_analysis: true
          },
          (error, result) => error ? reject(error) : resolve(result)
        );
        
        streamifier.createReadStream(optimizedBuffer).pipe(uploadStream);
      });

      req.uploadedFiles.push({
        url: result.secure_url,
        public_id: result.public_id
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

// Limpieza de imágenes
export const limpiarImagenesTemp = async (imagenes = []) => {
  await Promise.all(
    imagenes.map(img => 
      cloudinary.uploader.destroy(img.public_id)
        .catch(e => console.error(`Error limpiando ${img.public_id}:`, e))
    )
  );
};

