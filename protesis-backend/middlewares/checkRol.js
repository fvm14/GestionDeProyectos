function checkRol(rolEsperado) {
    return (req, res, next) => {
      const user = req.user;
  
      if (!user) {
        return res.status(401).json({ error: "No autenticado" });
      }
  
      if (user.rol !== rolEsperado) {
        return res.status(403).json({ error: "Acceso denegado para este rol" });
      }
  
      next();
    };
  }
  
  module.exports = checkRol;
  