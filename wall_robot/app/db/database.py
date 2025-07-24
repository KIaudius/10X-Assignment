from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path

# Create database directory if it doesn't exist
DB_DIR = Path(__file__).parent.parent.parent / "data"
os.makedirs(DB_DIR, exist_ok=True)

# SQLite database URL
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_DIR}/wall_robot.db"

# Create SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
