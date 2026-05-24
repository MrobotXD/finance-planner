import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password || password.length < 6) {
      return res.status(400).json({ error: 'Email y contraseña (mín. 6 caracteres) son obligatorios' });
    }

    const normalized = email.trim().toLowerCase();
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, $2)
       RETURNING id, email, currency, theme`,
      [normalized, hash]
    );

    const user = result.rows[0];
    const token = signToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, currency: user.currency, theme: user.theme },
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Este email ya está registrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error al registrar' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, currency, theme FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, email: user.email, currency: user.currency, theme: user.theme },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, currency, theme FROM users WHERE id = $1',
      [req.userId]
    );
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ user: { id: user.id, email: user.email, currency: user.currency, theme: user.theme } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

export default router;
