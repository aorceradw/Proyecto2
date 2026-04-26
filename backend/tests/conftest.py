# conftest.py
# PROPÓSITO: Sustituir la BD de Amazon RDS por SQLite en memoria durante los tests.

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import app.database as database

# 1. Sustituir el engine por SQLite ANTES de importar main
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
database.engine = engine

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
database.SessionLocal = TestingSessionLocal

# 2. Ahora sí importar main (ya usará el engine de SQLite)
from app.main import app
from app.database import Base, get_db

# 3. Crear las tablas en SQLite
Base.metadata.create_all(bind=engine)

# 4. Sustituir get_db
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db