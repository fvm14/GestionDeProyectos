// routes/users.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const db = require("../database/connection");
const checkRol = require("../middlewares/checkRol");

// Obtener todos los usuarios (solo admin)
router.get("/all", checkRol("administrador"), (req, res) => {
  User.findAll((err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener usuarios" });
    res.json(rows);
  });
});

// Obtener usuario por ID
router.get("/:id", (req, res) => {
  const { id } = req.params;
  User.findById(id, (err, user) => {
    if (err || !user) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(user);
  });
});

// Crear usuario manualmente (solo admin)
router.post("/create", checkRol("administrador"), (req, res) => {
  const { nombre, email, password, rol } = req.body;
  User.create(nombre, email, password, rol, (err) => {
    if (err) return res.status(500).json({ error: "Error al crear usuario" });
    res.json({ success: true });
  });
});

// Editar usuario (solo admin)
router.put("/update/:id", checkRol("administrador"), (req, res) => {
  const { id } = req.params;
  const data = req.body;
  User.update(id, data, (err) => {
    if (err) return res.status(500).json({ error: "Error al actualizar usuario" });
    res.json({ success: true });
  });
});

// Eliminar usuario (solo admin)
router.delete("/:id", checkRol("administrador"), (req, res) => {
  const { id } = req.params;
  User.delete(id, (err) => {
    if (err) return res.status(500).json({ error: "Error al eliminar usuario" });
    res.json({ success: true });
  });
});

// Obtener usuarios no verificados (solo admin)
router.get("/pending", checkRol("administrador"), (req, res) => {
  db.all(`SELECT * FROM users WHERE verificado = 0`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener pendientes" });
    res.json(rows);
  });
});

// Aprobar usuario (solo admin)
router.put("/approve/:id", checkRol("administrador"), (req, res) => {
  const { id } = req.params;
  db.run(`UPDATE users SET verificado = 1 WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: "Error al aprobar usuario" });
    res.json({ success: true });
  });
});

// Rechazar usuario (solo admin)
router.put("/reject/:id", checkRol("administrador"), (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM users WHERE id = ? AND verificado = 0`, [id], function (err) {
    if (err) return res.status(500).json({ error: "Error al rechazar usuario" });
    res.json({ success: true });
  });
});

module.exports = router;