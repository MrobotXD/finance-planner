import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

function mapExpense(row) {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    category: row.category,
    date: row.date instanceof Date ? row.date.toISOString().slice(0, 10) : row.date,
    currency: row.currency,
  };
}

function mapDebt(row) {
  return {
    id: row.id,
    creditor: row.creditor,
    principal: Number(row.principal),
    interestRate: Number(row.interest_rate),
    months: row.months,
    startDate: row.start_date instanceof Date ? row.start_date.toISOString().slice(0, 10) : row.start_date,
    currency: row.currency,
    paid: row.paid,
  };
}

router.get('/state', async (req, res) => {
  try {
    const [userRes, expensesRes, debtsRes] = await Promise.all([
      pool.query('SELECT currency, theme FROM users WHERE id = $1', [req.userId]),
      pool.query(
        'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC, created_at DESC',
        [req.userId]
      ),
      pool.query(
        'SELECT * FROM debts WHERE user_id = $1 ORDER BY created_at DESC',
        [req.userId]
      ),
    ]);

    const user = userRes.rows[0];
    res.json({
      currency: user?.currency ?? 'COP',
      theme: user?.theme ?? 'light',
      expenses: expensesRes.rows.map(mapExpense),
      debts: debtsRes.rows.map(mapDebt),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cargar datos' });
  }
});

router.patch('/preferences', async (req, res) => {
  try {
    const { currency, theme } = req.body;
    const fields = [];
    const values = [];
    let i = 1;

    if (currency) {
      fields.push(`currency = $${i++}`);
      values.push(currency);
    }
    if (theme) {
      fields.push(`theme = $${i++}`);
      values.push(theme);
    }
    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nada que actualizar' });
    }

    values.push(req.userId);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${i}`, values);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar preferencias' });
  }
});

router.post('/expenses', async (req, res) => {
  try {
    const { description, amount, category, date, currency } = req.body;
    const result = await pool.query(
      `INSERT INTO expenses (user_id, description, amount, category, date, currency)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, description, amount, category, date, currency]
    );
    res.status(201).json(mapExpense(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear gasto' });
  }
});

router.post('/expenses/import', async (req, res) => {
  const client = await pool.connect();
  try {
    const { expenses } = req.body;
    if (!Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({ error: 'Lista de gastos vacía' });
    }

    await client.query('BEGIN');
    const created = [];
    for (const e of expenses) {
      const result = await client.query(
        `INSERT INTO expenses (user_id, description, amount, category, date, currency)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [req.userId, e.description, e.amount, e.category, e.date, e.currency]
      );
      created.push(mapExpense(result.rows[0]));
    }
    await client.query('COMMIT');
    res.status(201).json(created);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Error al importar gastos' });
  } finally {
    client.release();
  }
});

router.delete('/expenses/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
});

router.post('/debts', async (req, res) => {
  try {
    const { creditor, principal, interestRate, months, startDate, currency } = req.body;
    const result = await pool.query(
      `INSERT INTO debts (user_id, creditor, principal, interest_rate, months, start_date, currency)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.userId, creditor, principal, interestRate, months, startDate, currency]
    );
    res.status(201).json(mapDebt(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear deuda' });
  }
});

router.delete('/debts/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM debts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Deuda no encontrada' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar deuda' });
  }
});

router.patch('/debts/:id/toggle-paid', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE debts SET paid = NOT paid
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Deuda no encontrada' });
    res.json(mapDebt(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar deuda' });
  }
});

export default router;
