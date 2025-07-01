import sharp from 'sharp';

const configureSharp = () => {
  sharp.cache({
    memory: 256, // MB
    files: 10,
    items: 100
  });
  sharp.concurrency(1);
  sharp.simd(process.env.NODE_ENV === 'production');
};

export default configureSharp;