/***********************************
 * index.js
 **********************************/
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
  // SSL opcional si tu RDS lo requiere:
  ssl: { rejectUnauthorized: false },
});

// Ruta básica: solo verifica que la app corre
app.get('/', (req, res) => {
  res.send('Hola, Render! La app está corriendo.');
});

// Endpoint para ver datos con tabla HTML profesional
app.get('/datos', async (req, res) => {
  try {
    // Consulta a la tabla con los alias definidos:
    const queryText = `
      SELECT
        ul.nombre AS "Nombre",
        ul.caller_number AS "Num Celular",
        ul.callercountry AS "Pais",
        ul.caller_zip_code AS "Z Code",
        ul.caller_city AS "Ciudad",
        ul.caller_state AS "Estado",
        ul.solo_o_acompanado AS "Solo",
        ul.tiene_seguro AS "Seguro",
        ul.chocaron_o_choco AS "Responsabilidad",
        ul.fecha_creacion AS "Fecha llamada"
      FROM public.user_llamada ul order by ul.fecha_creacion desc
    `;
    const result = await pool.query(queryText);

    // Los alias en la consulta (Nombre, Num Celular, etc.) serán las claves en result.rows
    const rows = result.rows; // Array de objetos
    // Obtenemos el orden de columnas según las keys del primer registro
    // (puedes fijar un orden manual si prefieres).
    let columns = [];
    if (rows.length > 0) {
      // Toma las claves de la primera fila (p.ej.: "Nombre", "Num Celular", etc.)
      columns = Object.keys(rows[0]);
    }

    // Componemos el HTML con estilos integrados:
    let html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8"/>
      <title>Dashboard de Llamadas</title>
      <style>
        /* Estilos generales */
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background-color: #f9f9f9; /* Blanco pedido */
        }
        /* Barra de encabezado */
        nav {
          background-color: #1b3549; /* Azul */
          padding: 1rem;
          color: #f9f9f9;
          font-size: 1.2rem;
        }
        /* Título */
        h1 {
          text-align: center;
          color: #1b3549; /* Azul */
          margin-top: 1rem;
        }
        /* Contenedor de la tabla */
        table {
          border-collapse: collapse;
          margin: 2rem auto;
          width: 90%;
          box-shadow: 0 2px 5px rgba(0,0,0,0.15);
          background-color: #f9f9f9; /* Blanco */
        }
        thead {
          background-color: #52b3f6; /* Celeste */
        }
        thead th {
          color: #fff;
          padding: 1rem;
          text-align: left;
          font-size: 1rem;
        }
        tbody td {
          padding: 0.8rem;
          border-bottom: 1px solid #ddd;
          color: #1b3549; /* Azul */
        }
        tbody tr:nth-child(even) {
          background-color: #eaf6fe; /* celeste claro */
        }
        tbody tr:hover {
          background-color: #d4ecfd; /* hover */
        }
      </style>
    </head>
    <body>
      <nav>Help on Crash - Datos Llamadas</nav>
      <h1>Registros ordenados por fecha de llamada</h1>
      <table>
        <thead>
          <tr>
    `;

    // Cabecera con los nombres de columna (alias) en orden
    columns.forEach(col => {
      html += `<th>${col}</th>`;
    });

    html += `
          </tr>
        </thead>
        <tbody>
    `;

    // Llenamos las filas con cada registro
    rows.forEach(row => {
      html += `<tr>`;
      columns.forEach(col => {
        const cellValue = row[col] !== null ? row[col] : '';
        html += `<td>${cellValue}</td>`;
      });
      html += `</tr>`;
    });

    html += `
        </tbody>
      </table>
    </body>
    </html>
    `;

    // Enviamos el HTML
    res.send(html);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error consultando la base de datos');
  }
});

// Iniciamos el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
