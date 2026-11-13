"""NOVA API — the core behind the NOVA personal AI universe."""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import nova_brain
import telemetry

API_VERSION = "1.0.0"

# Browser calls are same-origin through nginx in Docker; this only needs to
# cover the Vite dev server. Override with a comma-separated list if needed.
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "NOVA_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]

app = FastAPI(title="NOVA API", version=API_VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    reply: str
    engine: str


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "service": "NOVA API", "version": API_VERSION}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    return ChatResponse(reply=nova_brain.respond(request.message), engine="nova-core")


@app.get("/api/weather")
async def weather() -> dict:
    return telemetry.current_weather()


@app.get("/api/insights")
async def insights() -> dict:
    return {
        "snapshot": telemetry.universe_snapshot(),
        "activity": telemetry.activity_series(),
    }


@app.get("/api/recommendations")
async def recommendations() -> dict:
    return {"items": telemetry.recommendations()}


@app.get("/api/signals")
async def signals() -> dict:
    return {
        "feed": telemetry.signal_feed(),
        "channels": telemetry.channel_breakdown(),
        "activity": telemetry.activity_series(),
    }


@app.get("/api/briefing")
async def briefing() -> dict:
    """Everything the dashboard needs in a single round trip."""
    return {
        "weather": telemetry.current_weather(),
        "snapshot": telemetry.universe_snapshot(),
        "activity": telemetry.activity_series(),
        "recommendations": telemetry.recommendations(),
        "signals": telemetry.signal_feed(),
        "channels": telemetry.channel_breakdown(),
    }
