const db = require("../database/connection");

const User = {
  create: (nombre, email, password, rol, cb) => {
    const sql = `INSERT INTO users (nombre, email, password, rol) VALUES (?, ?, ?, ?)`;
    db.run(sql, [nombre, email, password, rol], cb);
  },

  findByEmail: (email, cb) => {
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], cb);
  },

  findAll: (cb) => {
    db.all(`SELECT * FROM users`, [], cb);
  },

  findById: (id, cb) => {
    db.get(`SELECT * FROM users WHERE id = ?`, [id], cb);
  },

  update: (id, data, cb) => {
    const sql = `UPDATE users SET nombre = ?, email = ?, password = ?, rol = ? WHERE id = ?`;
    db.run(sql, [data.nombre, data.email, data.password, data.rol, id], cb);
  },

  delete: (id, cb) => {
    db.run(`DELETE FROM users WHERE id = ?`, [id], cb);
  }
};

module.exports = User;
