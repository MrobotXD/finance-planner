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
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  const normalized = origin.replace(/\/$/, '');
  if (allowedOrigins.includes(normalized)) return true;
  // Render: web y API en *.onrender.com — evita fallos si CLIENT_URL no coincide exacto
  try {
    const host = new URL(normalized).hostname;
    if (host.endsWith('.onrender.com') && allowedOrigins.some((o) => o.includes('.onrender.com'))) {
      return true;
    }
  } catch {
    /* ignore */
  }
  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isAllowedOrigin(origin));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.json({
    name: 'Fintrack API',
    status: 'running',
    health: '/api/health',
    auth: '/api/auth/register | /api/auth/login',
    finance: '/api/finance/state (requiere token)',
  });
});

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`API escuchando en puerto ${PORT}`);
  });

  await initDb();
  console.log('Base de datos lista');
}

start().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});

process.on('SIGTERM', () => pool.end());
