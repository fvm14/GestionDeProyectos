// app.js
const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const setUserDev = require("./middlewares/setUserDev");
// Conexión a la base de datos (esto ejecuta también la creación de tablas y admin por defecto)
require("./database/connection");

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de archivos subidos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Importar y montar rutas
app.use("/auth", require("./routes/auth"));    
app.use(setUserDev);           // login y registro
app.use("/users", require("./routes/users"));             // gestión de usuarios
app.use("/cases", require("./routes/cases"));             // gestión de casos
app.use("/notificaciones", require("./routes/notificaciones")); // notificaciones

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Backend escuchando en http://localhost:${PORT}`);
});
