# Stock inventory

This repository contains a React/Vite frontend and a FastAPI backend.

## Frontend

The frontend source code is in `src/`.

```bash
npm install
npm run dev
```

## Backend

The FastAPI source code is in `app/`.

1. Create local settings:

   ```bash
   cp .env.example .env
   ```

2. Set the database URL and secure JWT secrets in `.env`.

3. Install and run the API:

   ```bash
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

## Backend structure

```text
app/
├── main.py                 # FastAPI application entry point
├── api/                    # Authorization dependencies and HTTP routers
├── core/                   # Configuration and security helpers
├── db/                     # SQLAlchemy engine and sessions
├── models/                 # Database table models
├── schemas/                # Request and response models
└── services/               # Business logic helpers
alembic/                    # Database migrations
```

`uploads/`, `.env`, `node_modules/`, virtual environments, and build output
are generated locally and intentionally excluded from Git.
