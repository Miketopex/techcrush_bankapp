
# Techcrush Bank App

A secure, decoupled, three-tier transactional banking application orchestrating an interactive user interface, an API core engine, and a relational database managed dynamically behind an ingress gateway proxy.

## System Architecture

The application stack consists of four containerized services communicating inside an isolated Docker virtual bridge network:

1. **Gateway (Nginx Proxy):** Serves as the single public entry point on port `80`. It manages request path-routing, sending static user interface views (`/`) to the frontend and financial payload mutations (`/api`) to the backend.
2. **Presentation Layer (Node.js Frontend):** Serves the account registry dashboard, fund transfer panels, and transaction logging tables.
3. **Logic Engine (Node.js API):** Runs backend business validation rules, balances calculations, and atomic database queries.
4. **Ledger Storage (PostgreSQL 15):** Records and secures user banking profiles and balances with full ACID transaction compliance.

---

## Tech Stack & Automation
* **Infrastructure:** AWS EC2 (Ubuntu Server)
* **Containerization:** Docker & Docker Compose
* **Ingress/Proxy:** Nginx
* **Backend Runtime:** Node.js (Express framework)
* **Database Driver:** `pg` (node-postgres)
* **CI/CD Pipeline:** GitHub Actions

---

## Local Installation & Deployment

To launch this entire financial application stack locally or on your cloud instance with a single command:

```bash
# Clone the repository
git clone https://github.com
cd techcrush-bankapp

# Initialize the environment containers
docker compose up -d --build
```

Once running cleanly, open your browser and navigate directly to your host IP address at `http://localhost` (no port suffix required).
