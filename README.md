# Stock Inventory Backend

FastAPI backend for the stock inventory application.

## Setup

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

## Structure

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

`uploads/`, `.env`, virtual environments, and build output are generated locally
and intentionally excluded from Git.
