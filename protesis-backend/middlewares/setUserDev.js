function setUserDev(req, res, next) {
  const headerUser = req.headers["x-dev-user"];

  if (headerUser) {
    try {
      req.user = JSON.parse(headerUser);
      console.log("🧠 Usuario recibido desde header:", req.user); // 👈 AGREGADO
    } catch (err) {
      return res.status(400).json({ error: "Formato de usuario inválido" });
    }
  } else {
    req.user = null;
    console.log("❌ No se envió x-dev-user");
  }

  next();
}

module.exports = setUserDev;
