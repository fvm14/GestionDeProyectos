const express = require("express");
const router = express.Router();
const db = require("../database/connection");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const checkRol = require("../middlewares/checkRol");

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Crear nuevo caso (solo doctor)
router.post("/create", checkRol("doctor"), (req, res) => {
  const {
    codigo, estado, progreso,
    doctor_id, paciente_id, disenador_id,
    notas, prototipo, mostrarPrototipo = 0
  } = req.body;

  const sql = `
    INSERT INTO cases (
      codigo, estado, progreso,
      doctor_id, paciente_id, disenador_id,
      notas, prototipo, mostrarPrototipo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    codigo, estado, progreso,
    doctor_id, paciente_id, disenador_id,
    notas, prototipo, mostrarPrototipo
  ];

  db.run(sql, values, function (err) {
    if (err) return res.status(500).json({ error: "Error al crear el caso" });

    const fecha = new Date().toISOString();
    db.run(
      `INSERT INTO notificaciones (user_id, mensaje, fecha) VALUES (?, ?, ?)`,
      [disenador_id, `Nuevo caso asignado: ${codigo}`, fecha]
    );

    res.json({ success: true, case_id: this.lastID });
  });
});

// Obtener todos los casos
router.get("/all", (req, res) => {
  db.all("SELECT * FROM cases", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al obtener casos" });
    res.json(rows);
  });
});

// Obtener casos por rol y usuario
router.get("/byUser", (req, res) => {
  const { rol, id } = req.query;

  let field = "";
  if (rol === "doctor") field = "doctor_id";
  else if (rol === "paciente") field = "paciente_id";
  else if (rol === "diseñador") field = "disenador_id";
  else return res.status(400).json({ error: "Rol inválido" });

  db.all(`SELECT * FROM cases WHERE ${field} = ?`, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al filtrar casos" });
    res.json(rows);
  });
});

// Actualizar caso (estado, progreso, notas, prototipo)
router.put("/update/:id", checkRol("doctor"), (req, res) => {
  const { estado, progreso, notas, prototipo } = req.body;
  const { id } = req.params;

  db.run(`
    UPDATE cases
    SET estado = ?, progreso = ?, notas = ?, prototipo = ?
    WHERE id = ?
  `, [estado, progreso, notas, prototipo, id], function (err) {
    if (err) return res.status(500).json({ error: "Error al actualizar caso" });

    db.get(`SELECT disenador_id, codigo FROM cases WHERE id = ?`, [id], (err, row) => {
      if (row) {
        const fecha = new Date().toISOString();
        db.run(
          `INSERT INTO notificaciones (user_id, mensaje, fecha) VALUES (?, ?, ?)`,
          [row.disenador_id, `Caso actualizado: ${row.codigo}`, fecha]
        );
      }
    });

    res.json({ success: true });
  });
});

// Eliminar caso
router.delete("/delete/:id", checkRol("administrador"), (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM cases WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: "Error al eliminar caso" });
    res.json({ success: true });
  });
});

// Filtrar casos por código y nombre del paciente
router.get("/filter", (req, res) => {
  const { codigo, nombre } = req.query;

  let sql = `
    SELECT cases.*, users.nombre as paciente_nombre
    FROM cases
    JOIN users ON cases.paciente_id = users.id
    WHERE 1 = 1
  `;

  const params = [];

  if (codigo) {
    sql += " AND cases.codigo LIKE ?";
    params.push(`%${codigo}%`);
  }

  if (nombre) {
    sql += " AND users.nombre LIKE ?";
    params.push(`%${nombre}%`);
  }

  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: "Error al filtrar casos" });
    res.json(rows);
  });
});

// Cambiar visibilidad del prototipo
router.put("/prototipo-visibility/:id", checkRol("doctor"), (req, res) => {
  const { mostrarPrototipo } = req.body;
  const { id } = req.params;

  db.run(
    `UPDATE cases SET mostrarPrototipo = ? WHERE id = ?`,
    [mostrarPrototipo ? 1 : 0, id],
    function (err) {
      if (err) return res.status(500).json({ error: "Error al cambiar visibilidad" });
      res.json({ success: true });
    }
  );
});

// Subir archivo de prototipo
router.post("/upload/:id", checkRol("diseñador"), upload.single("prototipo"), (req, res) => {
  const { id } = req.params;
  const filePath = req.file.path;

  db.run(
    `UPDATE cases SET prototipo = ? WHERE id = ?`,
    [filePath, id],
    function (err) {
      if (err) return res.status(500).json({ error: "Error al subir archivo" });
      res.json({ success: true, path: filePath });
    }
  );
});

// Eliminar archivo de prototipo
router.put("/delete-prototipo/:id", checkRol("diseñador"), (req, res) => {
  const { id } = req.params;

  db.get(`SELECT prototipo FROM cases WHERE id = ?`, [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: "Caso no encontrado" });

    const filePath = row.prototipo;
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    db.run(`UPDATE cases SET prototipo = NULL WHERE id = ?`, [id], function (err) {
      if (err) return res.status(500).json({ error: "Error al eliminar archivo" });
      res.json({ success: true });
    });
  });
});

module.exports = router;
