import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb, pool } from './db.js';
import authRoutes from './routes/auth.js';
import financeRoutes from './routes/finance.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);

async function start() {
  if (!process.env.DATABASE_URL) {
    console.error('Falta DATABASE_URL en las variables de entorno');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('Falta JWT_SECRET en las variables de entorno');
    process.exit(1);
  }

  await initDb();
  app.listen(PORT, () => {
    console.log(`API en http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});

process.on('SIGTERM', () => pool.end());
