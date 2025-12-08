
def test_login_empty():
    from Backend.app import app
    client = app.test_client()
    
    response = client.post('/api/inicio_sesion', json={})
    assert response.status_code == 400
