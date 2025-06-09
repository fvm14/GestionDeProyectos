const db = require("../database/connection");

const Case = {
  create: (codigo, estado, progreso, doctor_id, paciente_id, diseñador_id, notas, prototipo, cb) => {
    db.run(
      `INSERT INTO cases (codigo, estado, progreso, doctor_id, paciente_id, diseñador_id, notas, prototipo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo, estado, progreso, doctor_id, paciente_id, diseñador_id, notas, prototipo],
      cb
    );
  },

  getAll: (cb) => {
    db.all(`SELECT * FROM cases`, [], cb);
  },

  getByDoctor: (doctor_id, cb) => {
    db.all(`SELECT * FROM cases WHERE doctor_id = ?`, [doctor_id], cb);
  },

  getByPaciente: (paciente_id, cb) => {
    db.all(`SELECT * FROM cases WHERE paciente_id = ?`, [paciente_id], cb);
  }
};

module.exports = Case;
