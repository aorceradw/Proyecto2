from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import models, database
from .database import engine

# Crea las tablas en la base de datos al arrancar el servidor
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Gestión de Incidencias")

# Configuración CORS: permite que el frontend (aunque esté en otro puerto)
# pueda hacer peticiones a esta API sin ser bloqueado por el navegador
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Endpoint raíz para comprobar que la API está viva."""
    return {"status": "ok", "mensaje": "API de Incidencias funcionando"}


@app.get("/health")
def health():
    """Endpoint de salud, útil para que Docker o AWS comprueben que el servicio responde."""
    return {"status": "healthy"}


@app.get("/incidencias")
def leer_incidencias(
    estado: str = Query(None),       # Filtro opcional por estado
    prioridad: str = Query(None),    # Filtro opcional por prioridad
    db: Session = Depends(database.get_db)
):
    """Devuelve todas las incidencias. Se puede filtrar por estado y/o prioridad."""
    query = db.query(models.Incidencia)

    # Solo aplica el filtro si el parámetro fue enviado en la petición
    if estado:
        query = query.filter(models.Incidencia.estado == estado)
    if prioridad:
        query = query.filter(models.Incidencia.prioridad == prioridad)

    return {"status": "success", "data": query.all()}


@app.get("/incidencias/{id}")
def leer_incidencia(id: int, db: Session = Depends(database.get_db)):
    """Devuelve una incidencia concreta buscándola por su ID."""
    incidencia = db.query(models.Incidencia).filter(models.Incidencia.id == id).first()
    return incidencia


@app.post("/incidencias")
def crear_incidencia(incidencia: dict, db: Session = Depends(database.get_db)):
    """Crea una nueva incidencia a partir de los datos recibidos en el cuerpo de la petición."""
    nueva = models.Incidencia(**incidencia)  # Desempaqueta el dict como argumentos del modelo
    db.add(nueva)       # Añade el objeto a la sesión
    db.commit()         # Guarda los cambios en la base de datos
    db.refresh(nueva)   # Refresca el objeto para obtener el ID generado por la BD
    return nueva