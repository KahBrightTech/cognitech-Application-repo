"""Smoke tests for the NOVA API."""

from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_chat_returns_reply():
    response = client.post("/api/chat", json={"message": "what's the weather?"})
    assert response.status_code == 200
    assert response.json()["reply"]


def test_chat_rejects_empty_message():
    assert client.post("/api/chat", json={"message": ""}).status_code == 422


def test_briefing_shape():
    body = client.get("/api/briefing").json()
    assert {"weather", "snapshot", "activity", "recommendations"} <= body.keys()
    assert len(body["activity"]) == 24
