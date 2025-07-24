from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Wall(Base):
    __tablename__ = "walls"
    
    id = Column(Integer, primary_key=True, index=True)
    width = Column(Float, nullable=False)  # in meters
    height = Column(Float, nullable=False)  # in meters
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    obstacles = relationship("Obstacle", back_populates="wall", cascade="all, delete-orphan")
    trajectories = relationship("Trajectory", back_populates="wall", cascade="all, delete-orphan")


class Obstacle(Base):
    __tablename__ = "obstacles"
    
    id = Column(Integer, primary_key=True, index=True)
    wall_id = Column(Integer, ForeignKey("walls.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    x = Column(Float, nullable=False)  # x position in meters from bottom-left corner
    y = Column(Float, nullable=False)  # y position in meters from bottom-left corner
    width = Column(Float, nullable=False)  # in meters
    height = Column(Float, nullable=False)  # in meters
    obstacle_type = Column(String, default="window")  # window, door, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    wall = relationship("Wall", back_populates="obstacles")


class Trajectory(Base):
    __tablename__ = "trajectories"
    
    id = Column(Integer, primary_key=True, index=True)
    wall_id = Column(Integer, ForeignKey("walls.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    path = Column(JSON, nullable=False)  # List of [x, y] coordinates in meters
    total_distance = Column(Float, nullable=False)  # in meters
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    wall = relationship("Wall", back_populates="trajectories")
