# Pruebas Unitarias - Validación de endpoints
# Aquí comprobamos que la API funciona correctamente

from fastapi.testclient import TestClient
import sys
import os

# Agregar la carpeta 'app' al path para poder importar
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.main import app

# Cliente de pruebas
client = TestClient(app)

# Prueba 1: Verificar que la API está activa
def test_api_activa():
    """Comprueba que el endpoint raíz devuelve status ok"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

# Prueba 2: Verificar health check
def test_health_check():
    """Comprueba que el servidor está saludable"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

# Prueba 3: Obtener incidencias sin filtro
def test_obtener_incidencias_sin_filtro():
    """Comprueba que obtenemos todas las incidencias"""
    response = client.get("/incidencias")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "data" in data
    assert len(data["data"]) > 0

# Prueba 4: Filtrar incidencias por estado
def test_filtrar_incidencias_por_estado():
    """Comprueba que el filtro por estado funciona"""
    response = client.get("/incidencias?estado=abierta")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    # Todas las incidencias devueltas deben tener estado "abierta"
    for incidencia in data["data"]:
        assert incidencia["estado"].lower() == "abierta"

# Prueba 5: Obtener una incidencia por ID
def test_obtener_incidencia_por_id():
    """Comprueba que podemos obtener una incidencia específica"""
    response = client.get("/incidencias/1024")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1024
    assert "titulo" in data
    assert "descripcion" in data

# Prueba 6: Crear una nueva incidencia
def test_crear_incidencia():
    """Comprueba que podemos crear una nueva incidencia"""
    nueva_incidencia = {
        "titulo": "Prueba de API",
        "descripcion": "Esta es una incidencia de prueba",
        "prioridad": "media",
        "reportado_por": "test_usuario"
    }
    response = client.post("/incidencias", json=nueva_incidencia)
    assert response.status_code == 200
    data = response.json()
    assert data["titulo"] == nueva_incidencia["titulo"]
    assert "id" in data

# Ejecutar las pruebas
# En terminal: pytest tests/test_main.py -v
