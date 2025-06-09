const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database/db.sqlite");

db.serialize(() => {
  // Crear tablas si no existen
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      email TEXT UNIQUE,
      password TEXT,
      rol TEXT,
      verificado INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT,
      estado TEXT,
      progreso INTEGER,
      doctor_id INTEGER,
      paciente_id INTEGER,
      disenador_id INTEGER,
      notas TEXT,
      prototipo TEXT,
      mostrarPrototipo INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      mensaje TEXT,
      leido INTEGER DEFAULT 0,
      fecha TEXT
    )
  `);

  insertarUsuariosIniciales();
});

function insertarUsuariosIniciales() {
  // Admin por defecto
  db.get(`SELECT * FROM users WHERE rol = 'administrador' LIMIT 1`, (err, row) => {
    if (!row) {
      db.run(`
        INSERT INTO users (nombre, email, password, rol, verificado)
        VALUES (?, ?, ?, ?, ?)
      `, ["Admin Inicial", "admin@protesis.com", "admin123", "administrador", 1], (err) => {
        if (!err) console.log("✅ Admin por defecto creado (admin@protesis.com / admin123)");
      });
    }
  });

  // Paciente por defecto
  db.get(`SELECT * FROM users WHERE email = 'paciente1@protesis.com'`, (err, row) => {
    if (!row) {
      db.run(`
        INSERT INTO users (nombre, email, password, rol, verificado)
        VALUES (?, ?, ?, ?, ?)
      `, ["Carlos Paciente", "paciente1@protesis.com", "123456", "paciente", 1], (err) => {
        if (!err) console.log("✅ Paciente de prueba creado");
      });
    }
  });

  // Doctor por defecto
  db.get(`SELECT * FROM users WHERE email = 'doctor1@protesis.com'`, (err, row) => {
    if (!row) {
      db.run(`
        INSERT INTO users (nombre, email, password, rol, verificado)
        VALUES (?, ?, ?, ?, ?)
      `, ["Dra. Ana Torres", "doctor1@protesis.com", "123456", "doctor", 1], (err) => {
        if (!err) console.log("✅ Doctor de prueba creado");
      });
    }
  });

  // Diseñador por defecto
  db.get(`SELECT * FROM users WHERE email = 'disenador1@protesis.com'`, (err, row) => {
    if (!row) {
      db.run(`
        INSERT INTO users (nombre, email, password, rol, verificado)
        VALUES (?, ?, ?, ?, ?)
      `, ["Marco Diseñador", "disenador1@protesis.com", "123456", "diseñador", 1], (err) => {
        if (!err) console.log("✅ Diseñador de prueba creado");
      });
    }
  });
}

module.exports = db;
