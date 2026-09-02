
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Route 1: System Status
app.get('/api/status', async (req, res) => {
    let dbStatus = "Disconnected ❌";
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        dbStatus = "Connected ✅ (PostgreSQL Active)";
    } catch (err) {
        dbStatus = "Error Connecting ❌";
    }
    res.json({ message: `Online ✅ (Secure Financial Core Active). Database: \${dbStatus}` });
});

// Route 2: Get Accounts
app.get('/api/accounts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route 3: Create Account
app.post('/api/accounts', async (req, res) => {
    const { fullname, account_type, balance } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (fullname, account_type, balance) VALUES ($1, $2, $3) RETURNING *',
            [fullname, account_type, balance]
        );
        res.status(201).json({ success: true, user: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Route 4: Atomic Transfer Logic (ACID Compliance transaction)
app.post('/api/transfer', async (req, res) => {
    const { from_id, to_id, amount } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start SQL Transaction Block
        
        const senderCheck = await client.query('SELECT balance FROM users WHERE id = $1', [from_id]);
        if (senderCheck.rows.length === 0) throw new Error("Sender account missing.");
        
        const senderBalance = parseFloat(senderCheck.rows[0].balance);
        if (senderBalance < amount) throw new Error("Insufficient funds available.");

        await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, from_id]);
        await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, to_id]);
        
        await client.query('COMMIT'); // Commit all mutations atomically
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK'); // Revert changes on error
        res.status(400).json({ success: false, error: err.message });
    } finally {
        client.release();
    }
});

// Route 5: Close Account
app.delete('/api/accounts/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
});

