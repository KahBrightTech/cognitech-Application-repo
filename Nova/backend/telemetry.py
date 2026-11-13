"""Simulated telemetry for the NOVA dashboard.

Values drift smoothly over time from a time-seeded generator so the UI feels
alive while the container stays fully self-contained (no outbound calls).
"""

from __future__ import annotations

import math
import os
import random
from datetime import datetime, timedelta, timezone

CITY = os.getenv("NOVA_CITY", "San Francisco")

CONDITIONS = [
    ("Clear", "Perfect conditions for a walk — take the long way."),
    ("Partly Cloudy", "Mild and easy. A good day to be outside."),
    ("Overcast", "Soft light all day. Ideal for deep work."),
    ("Light Rain", "Grab a jacket if you're heading out."),
    ("Thunderstorms", "Best to stay in and let me keep you company."),
]


def _wave(period_minutes: float, offset: float = 0.0) -> float:
    """Smooth 0..1 oscillation driven by wall-clock time."""
    minutes = datetime.now(timezone.utc).timestamp() / 60.0
    return (math.sin((minutes / period_minutes) * 2 * math.pi + offset) + 1) / 2


def current_weather() -> dict:
    index = int(_wave(180) * (len(CONDITIONS) - 1))
    condition, advice = CONDITIONS[index]
    temperature = round(12 + _wave(240) * 14, 1)
    return {
        "city": CITY,
        "condition": condition,
        "advice": advice,
        "temperature_c": temperature,
        "feels_like_c": round(temperature - 1.5 + _wave(90) * 3, 1),
        "humidity": int(45 + _wave(120, 1.2) * 40),
        "wind_kph": round(4 + _wave(60, 2.4) * 18, 1),
        "uv_index": int(_wave(300) * 9),
        "observed_at": datetime.now(timezone.utc).isoformat(),
    }


def universe_snapshot() -> dict:
    return {
        "core_stability": round(96 + _wave(45) * 3.9, 1),
        "signals_processed": 184_000 + int(_wave(30, 0.7) * 42_000),
        "latency_ms": round(18 + _wave(20, 1.9) * 22, 1),
        "focus_score": int(62 + _wave(150, 0.3) * 36),
        "energy_level": int(55 + _wave(200, 2.1) * 42),
        "focus_window": random.choice(
            ["09:00 – 11:00", "10:30 – 12:30", "14:00 – 16:00", "15:30 – 17:30"]
        ),
        "active_sessions": 3 + int(_wave(80) * 9),
    }


def recommendations() -> list[dict]:
    pool = [
        {
            "id": "deep-work",
            "title": "Protect a deep-work block",
            "detail": "Your focus curve peaks soon. Two uninterrupted hours now beats a whole scattered afternoon.",
            "tag": "Focus",
            "accent": "violet",
        },
        {
            "id": "hydrate",
            "title": "Hydration check",
            "detail": "Energy dips often read as fatigue but are usually water. Refill before your next session.",
            "tag": "Wellbeing",
            "accent": "cyan",
        },
        {
            "id": "walk",
            "title": "Step outside for 12 minutes",
            "detail": "Conditions are good and short walks reliably lift afternoon focus scores.",
            "tag": "Movement",
            "accent": "emerald",
        },
        {
            "id": "inbox",
            "title": "Batch your messages",
            "detail": "Collapse replies into one window instead of reacting all day. Fewer context switches, more output.",
            "tag": "Flow",
            "accent": "fuchsia",
        },
        {
            "id": "wind-down",
            "title": "Plan tomorrow tonight",
            "detail": "Writing down your first task of the morning removes the hardest decision of the day.",
            "tag": "Planning",
            "accent": "amber",
        },
    ]
    start = int(_wave(240) * len(pool))
    return [pool[(start + offset) % len(pool)] for offset in range(3)]


def activity_series(points: int = 24) -> list[dict]:
    """Hourly signal volume for the dashboard sparkline."""
    return [
        {
            "hour": f"{hour:02d}:00",
            "value": int(30 + _wave(90, hour / 3.0) * 70),
        }
        for hour in range(points)
    ]


SIGNAL_EVENTS = [
    ("Telemetry sync completed", "sync", "info"),
    ("Focus curve recalculated", "focus", "ok"),
    ("Ambient conditions refreshed", "weather", "info"),
    ("Latency spike absorbed by buffer", "core", "warn"),
    ("Recommendation set rotated", "insight", "ok"),
    ("Voice channel idle — core listening", "voice", "info"),
    ("Energy baseline re-estimated", "focus", "ok"),
    ("Diagnostics pass: all subsystems nominal", "core", "ok"),
    ("Signal cache compacted", "sync", "info"),
    ("Thermal envelope within range", "core", "ok"),
]


def signal_feed(count: int = 8) -> list[dict]:
    """Recent core events, newest first."""
    now = datetime.now(timezone.utc)
    start = int(_wave(25) * len(SIGNAL_EVENTS))
    feed = []
    for offset in range(count):
        label, channel, level = SIGNAL_EVENTS[(start + offset) % len(SIGNAL_EVENTS)]
        stamp = now - timedelta(minutes=offset * 7 + int(_wave(13, offset) * 5))
        feed.append(
            {
                "id": f"sig-{offset}",
                "label": label,
                "channel": channel,
                "level": level,
                "at": stamp.isoformat(),
                "magnitude": int(20 + _wave(40, offset * 0.8) * 80),
            }
        )
    return feed


def channel_breakdown() -> list[dict]:
    """Share of today's signals per channel."""
    channels = ["core", "focus", "weather", "voice", "sync"]
    raw = [12 + _wave(70, index * 1.3) * 60 for index in range(len(channels))]
    total = sum(raw)
    return [
        {"channel": channel, "share": round(value / total * 100, 1), "count": int(value * 140)}
        for channel, value in zip(channels, raw)
    ]

