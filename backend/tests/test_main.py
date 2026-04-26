from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_responde():
    """Verifica que la API enciende y responde correctamente."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"mensaje": "API de Incidencias funcionando"}

def test_lista_incidencias_ok():
    """Verifica que el endpoint de incidencias responde con 200."""
    response = client.get("/incidencias")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_filtro_por_prioridad_alta():
    """Verifica que el filtro por prioridad no rompe la API."""
    response = client.get("/incidencias?prioridad=alta")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_filtro_por_prioridad_media():
    """Verifica que el filtro por prioridad media funciona."""
    response = client.get("/incidencias?prioridad=media")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
