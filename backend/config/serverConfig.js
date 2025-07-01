export const configureServer = (app) => {
  // Aumentar timeout a 5 minutos para rutas de subida
  app.use((req, res, next) => {
    if (req.path.includes('/autos') && req.method === 'POST' || req.method === 'PUT') {
      req.setTimeout(300000); // 5 minutos
      res.setTimeout(300000);
    }
    next();
  });
};