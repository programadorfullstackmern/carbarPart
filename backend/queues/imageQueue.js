const Queue = require('bull');
const { uploadImage } = require('../utils/cloudinary');
const sharp = require('sharp');

const imageQueue = new Queue('image-processing', {
  redis: process.env.REDIS_URL // Ej: 'redis://127.0.0.1:6379'
});

imageQueue.process(async (job) => {
  const { buffer } = job.data;
  const compressedBuffer = await sharp(buffer)
    .resize(800)
    .jpeg({ quality: 80 })
    .toBuffer();
  const result = await uploadImage(compressedBuffer);
  return result;
});

module.exports = imageQueue;