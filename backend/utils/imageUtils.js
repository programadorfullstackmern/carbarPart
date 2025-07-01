import sharp from 'sharp';
import cloudinary from '../config/cloudinary.js';

// Configurar sharp para máxima eficiencia
sharp.cache({ memory: 512 });
sharp.simd(true);

export const optimizarBufferImagen = async (buffer) => {
  try {
    const metadata = await sharp(buffer).metadata();
    
    return sharp(buffer)
      .rotate()
      .resize({
        width: 2500,
        height: 2500,
        fit: 'inside',
        withoutEnlargement: true,
        fastShrinkOnLoad: true
      })
      .toFormat('webp', {
        quality: 80,
        alphaQuality: 80,
        effort: 3
      })
      .withMetadata()
      .toBuffer();
  } catch (error) {
    throw new Error(`Error optimizando imagen: ${error.message}`);
  }
};

export const limpiarImagenesTemp = async (imagenes = []) => {
  await Promise.all(
    imagenes.map(img => 
      cloudinary.uploader.destroy(img.public_id)
        .catch(e => console.error(`Error limpiando ${img.public_id}:`, e))
    )
  );
};