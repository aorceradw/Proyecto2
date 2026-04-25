from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, database
from .database import engine

# Crea las tablas en la BD al arrancar el contenedor
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Gestión de Incidencias")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    """Comprobación de que la API está viva."""
    return {"mensaje": "API de Incidencias funcionando"}


@app.get("/incidencias")
def leer_incidencias(
    prioridad: str = Query(None),
    db: Session = Depends(database.get_db)
):
    """Devuelve todas las incidencias. Filtra por prioridad si se indica."""
    query = db.query(models.Incidencia)
    if prioridad:
        query = query.filter(models.Incidencia.prioridad == prioridad)
    return query.all()

