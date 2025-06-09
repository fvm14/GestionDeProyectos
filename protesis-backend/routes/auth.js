const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Registro sin aprobación manual
router.post("/register", (req, res) => {
  const { nombre, email, password, rol } = req.body;

  // Insertar con verificado = 1 automáticamente
  const db = require("../database/connection");
  const sql = `INSERT INTO users (nombre, email, password, rol, verificado) VALUES (?, ?, ?, ?, 1)`;

  db.run(sql, [nombre, email, password, rol], function (err) {
    if (err) return res.status(500).json({ error: "Error registrando usuario" });
    return res.json({ success: true });
  });
});

// Login (sin cambios)
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  User.findByEmail(email, (err, user) => {
    if (err || !user) return res.status(404).json({ error: "Usuario no encontrado" });
    if (user.password !== password) return res.status(401).json({ error: "Contraseña incorrecta" });
    if (!user.verificado) return res.status(403).json({ error: "Usuario no verificado" });
    return res.json({ success: true, user });
  });
});

module.exports = router;
