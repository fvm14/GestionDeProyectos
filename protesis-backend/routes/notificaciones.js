const express = require("express");
const router = express.Router();
const db = require("../database/connection");

// Obtener todas las notificaciones de un usuario
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  db.all(
    `SELECT * FROM notificaciones WHERE user_id = ? ORDER BY fecha DESC`,
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Error al obtener notificaciones" });
      res.json(rows);
    }
  );
});

// Eliminar una notificación (marcar como leída)
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM notificaciones WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: "Error al eliminar notificación" });
    res.json({ success: true });
  });
});

module.exports = router;
