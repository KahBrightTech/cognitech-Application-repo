"""NOVA's offline conversational engine.

Deterministic, dependency-free intent matching so the container works with no
API keys and no outbound network access.
"""

from __future__ import annotations

import random
import re
from datetime import datetime, timezone
from typing import Callable

from telemetry import current_weather, universe_snapshot

Handler = Callable[[str], str]


def _greeting(_: str) -> str:
    hour = datetime.now(timezone.utc).hour
    part = "morning" if hour < 12 else "afternoon" if hour < 18 else "evening"
    return (
        f"Good {part}. NOVA is online and all systems are nominal. "
        "Ask me about the weather, your focus for today, or anything on your mind."
    )


def _weather(_: str) -> str:
    w = current_weather()
    return (
        f"It's {w['temperature_c']}°C in {w['city']} right now — {w['condition'].lower()}, "
        f"feels like {w['feels_like_c']}°C with {w['humidity']}% humidity and "
        f"{w['wind_kph']} km/h winds. {w['advice']}"
    )


def _status(_: str) -> str:
    u = universe_snapshot()
    return (
        f"Core stability is at {u['core_stability']}%, I've processed "
        f"{u['signals_processed']:,} signals today, and latency is holding at "
        f"{u['latency_ms']} ms. Focus score: {u['focus_score']}/100."
    )


def _identity(_: str) -> str:
    return (
        "I'm NOVA — a Neural Operations and Virtual Assistance core. I run entirely "
        "inside this container, so nothing you say leaves your machine."
    )


def _capabilities(_: str) -> str:
    return (
        "I can brief you on conditions, track your focus and energy, surface "
        "recommendations, and hold a conversation. Try: \"what's the weather\", "
        "\"system status\", \"what should I focus on\", or \"tell me something "
        "about space\"."
    )


def _focus(_: str) -> str:
    u = universe_snapshot()
    return (
        f"Your focus score is {u['focus_score']}/100. The strongest window today is "
        f"{u['focus_window']}. I'd protect that block, silence notifications, and put "
        "your hardest task first."
    )


PLANETS = {
    "mercury": "Mercury is the smallest planet and the closest to the Sun. It has almost no atmosphere, so its surface swings from about 430°C in daylight to -180°C at night.",
    "venus": "Venus rotates once every 243 Earth days — a day there is longer than its year. Its thick CO₂ atmosphere traps enough heat to melt lead.",
    "earth": "Earth is the only world we know where liquid water, a magnetic shield, and a stable climate line up at once. That overlap is rarer than it sounds.",
    "mars": "Mars hosts Olympus Mons, the tallest volcano in the solar system at roughly three times the height of Everest. Its thin atmosphere still whips up planet-wide dust storms.",
    "jupiter": "Jupiter's Great Red Spot is a storm wider than Earth that has been spinning for centuries. It also has the shortest day of any planet — under 10 hours.",
    "saturn": "Saturn's rings are mostly water ice, some chunks the size of houses, spread across a span wider than the Earth-Moon distance — yet only tens of metres thick.",
    "uranus": "Uranus orbits tipped on its side at about 98°, so each pole gets 42 years of continuous sunlight followed by 42 years of darkness.",
    "neptune": "Neptune has the fastest winds in the solar system, clocked above 2,000 km/h, despite receiving barely any sunlight.",
    "pluto": "Pluto is smaller than our Moon and its orbit is tilted and stretched enough that it sometimes sits closer to the Sun than Neptune.",
    "sun": "The Sun holds 99.86% of the solar system's mass, and its light takes about 8 minutes and 20 seconds to reach you.",
    "moon": "The Moon is drifting away from Earth at about 3.8 cm per year, slowly lengthening our days.",
}


def _space(message: str) -> str:
    for name, fact in PLANETS.items():
        if name in message:
            return fact

    facts = [
        "A day on Venus is longer than its year — it rotates once every 243 Earth days.",
        "Neutron stars can spin 600 times per second, each rotation a precise pulse.",
        "There are more stars in the observable universe than grains of sand on Earth.",
        "Jupiter's Great Red Spot is a storm wider than our entire planet.",
        "Light from the Sun takes about 8 minutes and 20 seconds to reach you.",
    ]
    return random.choice(facts)


def _thanks(_: str) -> str:
    return "Any time. I'm always listening."


def _time(_: str) -> str:
    now = datetime.now(timezone.utc)
    return f"It's {now.strftime('%H:%M')} UTC on {now.strftime('%A, %d %B %Y')}."


INTENTS: list[tuple[re.Pattern[str], Handler]] = [
    (re.compile(r"\b(hi|hey|hello|good (morning|afternoon|evening)|yo)\b"), _greeting),
    (re.compile(r"\b(weather|temperature|forecast|rain|sunny|cold|hot)\b"), _weather),
    (re.compile(r"\b(status|system|health|diagnostics|how are you)\b"), _status),
    (re.compile(r"\b(who are you|your name|what are you|about you)\b"), _identity),
    (re.compile(r"\b(help|what can you do|capabilities|commands)\b"), _capabilities),
    (re.compile(r"\b(focus|productive|priorit|plan my day|task)\b"), _focus),
    (re.compile(r"\b(space|planet|star|universe|galaxy|astronom|moon|sun|mercury|venus|earth|mars|jupiter|saturn|uranus|neptune|pluto)\b"), _space),
    (re.compile(r"\b(thanks|thank you|appreciate)\b"), _thanks),
    (re.compile(r"\b(time|date|what day)\b"), _time),
]

FALLBACKS = [
    "I hear you. I'm running offline right now, so my answers stay close to home — "
    "try asking about the weather, your focus, or system status.",
    "Noted. My local core handles conditions, focus, and diagnostics. What would you "
    "like me to pull up?",
    "That one's outside my offline core. Ask me for a briefing and I'll give you the "
    "full picture.",
]


def respond(message: str) -> str:
    text = message.strip().lower()
    if not text:
        return _capabilities("")
    for pattern, handler in INTENTS:
        if pattern.search(text):
            return handler(text)
    return random.choice(FALLBACKS)
