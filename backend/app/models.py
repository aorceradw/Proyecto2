from sqlalchemy import Column, Integer, String, Text
from .database import Base

class Incidencia(Base):
    __tablename__ = "incidencias"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text)
    prioridad = Column(String(20), default="media")
    estado = Column(String(20), default="abierta")
    reportado_por = Column(String(100))

