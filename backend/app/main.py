from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from . import models
from .database import engine, get_db

# Crea las tablas en la BD si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Gestión de Incidencias")

# CORS: permite que el frontend llame a la API desde el navegador
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schema Pydantic para validar el body del POST ────────────────────────────
class IncidenciaCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    prioridad: Optional[str] = "media"
    reportado_por: Optional[str] = None


# ── GET /incidencias — Listar con filtros opcionales ────────────────────────
@app.get("/incidencias")
def get_incidencias(
    estado:    Optional[str] = Query(None, description="Filtrar por estado: abierta / cerrada"),
    prioridad: Optional[str] = Query(None, description="Filtrar por prioridad: alta / media / baja"),
    db: Session = Depends(get_db)
):
    """
    Devuelve todas las incidencias.
    Se puede filtrar con ?estado=abierta y/o ?prioridad=alta
    """
    query = db.query(models.Incidencia)

    if estado:
        query = query.filter(models.Incidencia.estado == estado)
    if prioridad:
        query = query.filter(models.Incidencia.prioridad == prioridad)

    incidencias = query.all()

    # Devuelve formato { status, data: [...] } para que el JS lo maneje
    return {
        "status": "success",
        "data": [
            {
                "id":           i.id,
                "titulo":       i.titulo,
                "descripcion":  i.descripcion,
                "prioridad":    i.prioridad,
                "estado":       i.estado,
                "reportado_por": i.reportado_por,
            }
            for i in incidencias
        ]
    }


# ── GET /incidencias/{id} — Obtener una incidencia por ID ───────────────────
@app.get("/incidencias/{incidencia_id}")
def get_incidencia(incidencia_id: int, db: Session = Depends(get_db)):
    """Devuelve una incidencia concreta. Lanza 404 si no existe."""
    item = db.query(models.Incidencia).filter(
        models.Incidencia.id == incidencia_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")

    return {
        "status": "success",
        "data": {
            "id":           item.id,
            "titulo":       item.titulo,
            "descripcion":  item.descripcion,
            "prioridad":    item.prioridad,
            "estado":       item.estado,
            "reportado_por": item.reportado_por,
        }
    }


# ── POST /incidencias — Crear una nueva incidencia ───────────────────────────
@app.post("/incidencias", status_code=201)
def crear_incidencia(incidencia: IncidenciaCreate, db: Session = Depends(get_db)):
    """
    Crea una nueva incidencia.
    El frontend envía: titulo, descripcion, prioridad, reportado_por
    """
    nueva = models.Incidencia(
        titulo=incidencia.titulo,
        descripcion=incidencia.descripcion,
        prioridad=incidencia.prioridad or "media",
        estado="abierta",           # siempre empieza como abierta
        reportado_por=incidencia.reportado_por,
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    return {
        "status": "success",
        "data": {
            "id":           nueva.id,
            "titulo":       nueva.titulo,
            "descripcion":  nueva.descripcion,
            "prioridad":    nueva.prioridad,
            "estado":       nueva.estado,
            "reportado_por": nueva.reportado_por,
        }
    }