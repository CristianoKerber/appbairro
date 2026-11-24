require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

const toUser = (r) => ({
  id: r.id,
  username: r.username,
  email: r.email,
  password: r.password,
  phoneNumber: r.phone_number,
  address: r.address,
});

const toCollect = (r) => ({
  id: r.id,
  collected: !!r.collected,
  collectDate: r.collect_date,
  itemName: r.item_name,
  itemDescription: r.item_description,
  quantity: r.quantity,
  userId: r.user_id,
});

const erro = (res, e, status = 500) => {
  console.error(e);
  res.status(status).json({ message: e.message });
};

// USUARIOS
app.post('/api/users/save', async (req, res) => {
  const { username, password, email, phoneNumber, address } = req.body;
  try {
    const [r] = await pool.query(
      'INSERT INTO users (username, password, email, phone_number, address) VALUES (?,?,?,?,?)',
      [username ?? null, password ?? null, email ?? null, phoneNumber ?? null, address ?? null]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [r.insertId]);
    res.status(201).json(toUser(rows[0]));
  } catch (e) {
    erro(res, e, 400);
  }
});

app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email ?? null, password ?? null]
    );
    if (!rows.length) return res.status(401).json({ message: 'Usuário ou senha incorretos.' });
    res.json(toUser(rows[0]));
  } catch (e) {
    erro(res, e);
  }
});

app.get('/api/users/all', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(rows.map(toUser));
  } catch (e) {
    erro(res, e);
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json(toUser(rows[0]));
  } catch (e) {
    erro(res, e);
  }
});

app.put('/api/users/update/:id', async (req, res) => {
  const b = req.body;
  const campos = {
    username: b.username,
    email: b.email,
    password: b.password,
    phone_number: b.phoneNumber,
    address: b.address,
  };
  const sets = Object.entries(campos).filter(([, v]) => v !== undefined);
  if (!sets.length) return res.status(400).json({ message: 'Nada para atualizar.' });
  try {
    await pool.query(
      `UPDATE users SET ${sets.map(([k]) => `${k} = ?`).join(', ')} WHERE id = ?`,
      [...sets.map(([, v]) => v), req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    res.json(toUser(rows[0]));
  } catch (e) {
    erro(res, e, 400);
  }
});

// COLETAS
app.post('/api/collects/save', async (req, res) => {
  const b = req.body;
  const userId = b.userId ?? b.user?.id ?? null;
  try {
    const [r] = await pool.query(
      `INSERT INTO collects (collected, collect_date, item_name, item_description, quantity, user_id)
       VALUES (?,?,?,?,?,?)`,
      [b.collected ? 1 : 0, b.collectDate ?? null, b.itemName ?? null,
       b.itemDescription ?? null, b.quantity ?? null, userId]
    );
    const [rows] = await pool.query('SELECT * FROM collects WHERE id = ?', [r.insertId]);
    res.status(201).json(toCollect(rows[0]));
  } catch (e) {
    erro(res, e, 400);
  }
});

app.get('/api/collects/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.username, u.email, u.phone_number, u.address
       FROM collects c
       LEFT JOIN users u ON u.id = c.user_id
       ORDER BY c.id DESC`
    );
    res.json(
      rows.map((r) => ({
        ...toCollect(r),
        username: r.username,
        userName: r.username,
        address: r.address,
        user: r.user_id
          ? {
              id: r.user_id,
              username: r.username,
              email: r.email,
              phoneNumber: r.phone_number,
              address: r.address,
            }
          : null,
      }))
    );
  } catch (e) {
    erro(res, e);
  }
});

app.get('/api/collects/latestStatus', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM collects ORDER BY id DESC LIMIT 1');
    res.json(rows.length ? toCollect(rows[0]) : null);
  } catch (e) {
    erro(res, e);
  }
});

app.get('/api/collects/monthlyDistribution', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT COALESCE(item_name, 'Outros') AS itemName, SUM(quantity) AS totalQuantity
       FROM collects
       WHERE created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
       GROUP BY itemName`
    );
    res.json(rows.map((r) => ({ itemName: r.itemName, totalQuantity: Number(r.totalQuantity) })));
  } catch (e) {
    erro(res, e);
  }
});

app.put('/api/collects/update/:id', async (req, res) => {
  const b = req.body;
  const campos = {
    collected: b.collected === undefined ? undefined : (b.collected ? 1 : 0),
    collect_date: b.collectDate,
    item_name: b.itemName,
    item_description: b.itemDescription,
    quantity: b.quantity,
    user_id: b.userId ?? b.user?.id,
  };
  const sets = Object.entries(campos).filter(([, v]) => v !== undefined);
  if (!sets.length) return res.status(400).json({ message: 'Nada para atualizar.' });
  try {
    await pool.query(
      `UPDATE collects SET ${sets.map(([k]) => `${k} = ?`).join(', ')} WHERE id = ?`,
      [...sets.map(([, v]) => v), req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM collects WHERE id = ?', [req.params.id]);
    res.json(toCollect(rows[0]));
  } catch (e) {
    erro(res, e, 400);
  }
});

app.listen(3000, '0.0.0.0', () => console.log('API rodando na porta 3000'));