
const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Techcrush Bank App</title>
            <style>
                body { font-family: sans-serif; margin: 0; padding: 40px; background: #f0f2f5; color: #333; display: flex; justify-content: center; gap: 30px; }
                .box { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 450px; text-align: left; }
                h1, h2 { color: #1877f2; text-align: center; margin-top: 0; }
                .status-bar { font-weight: bold; color: #28a745; margin-bottom: 25px; font-size: 14px; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 15px; }
                .form-group { margin-bottom: 15px; }
                label { display: block; font-weight: bold; margin-bottom: 5px; font-size: 14px; }
                input, select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; }
                button { width: 100%; padding: 12px; background: #1877f2; color: white; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; font-size: 16px; margin-top: 10px; }
                button:hover { background: #145dbf; }
                .btn-danger { background: #dc3545; width: auto; padding: 5px 10px; font-size: 12px; margin: 0; }
                .btn-danger:hover { background: #bd2130; }
                .account-list { margin-top: 25px; }
                .account-item { background: #f8f9fa; padding: 12px; border-left: 4px solid #1877f2; margin-bottom: 8px; border-radius: 3px; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
            </style>
        </head>
        <body>
            <div class="box">
                <h1>🏦 Techcrush Bank</h1>
                <div id="status" class="status-bar">Syncing ledger connection...</div>

                <h3>New Account Registry</h3>
                <form id="accountForm">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="fullname" placeholder="John Doe" required />
                    </div>
                    <div class="form-group">
                        <label>Account Type</label>
                        <select id="account_type">
                            <option value="Savings">Savings Account</option>
                            <option value="Current">Current Account</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Initial Deposit ($)</label>
                        <input type="number" id="balance" placeholder="500.00" min="0" step="0.01" required />
                    </div>
                    <button type="submit">Open Bank Account</button>
                </form>

                <div class="account-list">
                    <h3>Active Ledger Users</h3>
                    <div id="usersContainer">Loading account ledger...</div>
                </div>
            </div>

            <div class="box" style="height: fit-content;">
                <h2>💸 Inter-Account Transfer</h2>
                <form id="transferForm">
                    <div class="form-group">
                        <label>Sender Account ID</label>
                        <input type="number" id="from_id" placeholder="e.g. 2" required   />
                    </div>
                    <div class="form-group">
                        <label>Recipient Account ID</label>
                        <input type="number" id="to_id" placeholder="e.g. 1" required />
                    </div>
                    <div class="form-group">
                        <label>Transfer Amount ($)</label>
                        <input type="number" id="amount" placeholder="150.00" min="0.01" step="0.01" required />
                    </div>
                    <button type="submit" style="background: #28a745;">Execute Secure Transfer</button>
                </form>
            </div>

            <script>
                // We use port 80 now because our incoming Nginx reverse proxy handles routing seamlessly!
                const apiBase = 'http://' + window.location.hostname + '/api';

                function loadStatus() {
                    fetch(\`\${apiBase}/status\`)
                        .then(res => res.json())
                        .then(data => document.getElementById('status').innerText = data.message)
                        .catch(() => document.getElementById('status').innerText = "System Offline ❌");
                }

                function loadAccounts() {
                    fetch(\`\${apiBase}/accounts\`)
                        .then(res => res.json())
                        .then(users => {
                            const container = document.getElementById('usersContainer');
                            if(users.length === 0) {
                                container.innerHTML = '<p style="color: #888; font-size: 13px;">No accounts found.</p>';
                                return;
                            }
                            container.innerHTML = users.map(u => \`
                                <div class="account-item">
                                    <span><strong>ID: \${u.id}</strong> - \${u.fullname} (\${u.account_type})</span>
                                    <div style="display: flex; gap: 10px; align-items: center;">
                                        <strong>$\${parseFloat(u.balance).toFixed(2)}</strong>
                                        <button class="btn-danger" onclick="deleteAccount(\${u.id})">Close</button>
                                    </div>
                                </div>
                            \`).join('');
                        });
                }

                document.getElementById('accountForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const payload = {
                        fullname: document.getElementById('fullname').value,
                        account_type: document.getElementById('account_type').value,
                        balance: parseFloat(document.getElementById('balance').value)
                    };
                    fetch(\`\${apiBase}/accounts\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }).then(() => {
                        document.getElementById('accountForm').reset();
                        loadAccounts();
                    });
                });

                document.getElementById('transferForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const payload = {
                        from_id: parseInt(document.getElementById('from_id').value),
                        to_id: parseInt(document.getElementById('to_id').value),
                        amount: parseFloat(document.getElementById('amount').value)
                    };
                    fetch(\`\${apiBase}/transfer\`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    }).then(res => res.json())
                    .then(data => {
                        if(data.success) {
                            alert("Transfer completed safely!");
                            document.getElementById('transferForm').reset();
                            loadAccounts();
                        } else {
                            alert("Transfer denied: " + data.error);
                        }
                    });
                });

                function deleteAccount(id) {
                    if(confirm("Are you sure you want to close account ID " + id + "?")) {
                        fetch(\`\${apiBase}/accounts/\${id}\`, { method: 'DELETE' })
                            .then(() => loadAccounts());
                    }
                }

                loadStatus();
                loadAccounts();
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Frontend running cleanly on port ${PORT}`);
});

