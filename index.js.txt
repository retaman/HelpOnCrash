// index.js
const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de la base (usando variables de entorno)
const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  // ssl opcional si tu RDS lo requiere:
  ssl: { rejectUnauthorized: false },
});

app.get('/', (req, res) => {
  res.send('Hola, Render! La app está corriendo.');
});

// Ejemplo: endpoint para ver datos de la tabla user_llamada
app.get('/datos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.user_llamada');
    // Devolvemos un JSON con los registros
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error consultando la base de datos');
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
