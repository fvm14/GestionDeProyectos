router.post("/create", (req, res) => {
    const {
      codigo, estado, progreso,
      doctor_id, paciente_id, disenador_id,
      notas, prototipo,
      mostrarPrototipo = 0, // nuevo campo
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
      return res.json({ success: true, case_id: this.lastID });
    });
  });
  