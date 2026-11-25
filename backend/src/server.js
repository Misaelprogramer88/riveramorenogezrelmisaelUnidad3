import app from './app.js';
import { env } from './config/env.js';

app.listen(env.port, () => {
  console.log(`\n=============================================================`);
  console.log(`  POSCore API RESTful ejecutándose en http://localhost:${env.port}`);
  console.log(`  Seguridad activa: Helmet + CORS (${env.corsOrigin}) + JWT + Bcrypt`);
  console.log(`  Base de datos JSON: ${env.dbFile}`);
  console.log(`=============================================================\n`);
});
