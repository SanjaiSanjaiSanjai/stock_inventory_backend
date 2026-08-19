# FastAPI inventory service

## Run the application

1. Create your local environment file from the template:

   ```bash
   cp .env.example .env
   ```

2. Set secure secrets and your database connection in `.env`.

3. Install dependencies and run the API:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Project structure

```text
app/
├── main.py                 # FastAPI application entry point
├── api/
│   ├── dependencies.py     # Authentication and role dependencies
│   └── v1/                 # HTTP endpoints grouped by feature
├── core/
│   ├── config.py           # Environment-based configuration
│   └── security.py         # Password hashing and JWT utilities
├── db/
│   └── session.py          # SQLAlchemy engine and DB session dependency
├── models/
│   └── entities.py         # SQLAlchemy table models
├── schemas/                # Pydantic request and response models
└── services/               # Reusable business logic
alembic/                    # Database migration scripts
uploads/                    # Runtime product images; ignored by Git
.env.example                # Safe configuration template
requirements.txt            # Python dependencies
alembic.ini                 # Alembic configuration
```

All production code belongs under `app/`. Run the API only with:

```bash
uvicorn app.main:app --reload
```
