"""
HirePath – Job Matching Engine
Computes a weighted percentage match between a parsed resume and each job listing.
"""

from typing import Dict, Any, List
from job_database import JOBS

# Education level hierarchy
EDUCATION_RANK = {
    "high_school": 0,
    "associate": 1,
    "bachelor": 2,
    "master": 3,
    "phd": 4,
}

# Category-to-title keyword mapping for title relevance
CATEGORY_TITLE_KEYWORDS = {
    "Engineering": ["engineer", "developer", "programmer", "architect", "devops", "sre", "reliability"],
    "Data Science": ["data", "analyst", "scientist", "ml", "ai", "machine learning", "analytics", "bi"],
    "Product": ["product", "ux", "designer", "scrum", "agile", "owner"],
    "Marketing": ["marketing", "seo", "content", "growth", "social", "digital"],
    "Sales": ["sales", "account", "revenue", "business development"],
    "Finance": ["finance", "financial", "accounting", "analyst", "investment", "banker", "quantitative"],
    "Healthcare": ["nurse", "physician", "doctor", "clinical", "medical", "health"],
    "Project Management": ["project", "program", "manager", "pmo"],
    "Human Resources": ["hr", "human resources", "recruiter", "talent", "people"],
    "Research": ["research", "scientist", "phd"],
    "Education": ["teacher", "instructor", "educator", "professor"],
    "Operations": ["operations", "logistics", "supply chain"],
    "Technical Writing": ["writer", "documentation"],
    "Design": ["designer", "graphic", "creative"],
}


def _skills_score(resume_skills: List[str], required: List[str], preferred: List[str]) -> float:
    """Percentage of required (+ bonus for preferred) skills matched."""
    if not required:
        return 50.0

    resume_lower = {s.lower() for s in resume_skills}
    required_matched = sum(1 for s in required if s.lower() in resume_lower)
    preferred_matched = sum(1 for s in preferred if s.lower() in resume_lower)

    # Base: required match ratio
    base = (required_matched / len(required)) * 100

    # Bonus: each preferred skill adds up to 5 points (capped at 15)
    bonus = min(preferred_matched * 5, 15)

    return min(base + bonus, 100.0)


def _experience_score(resume_years: int, min_years: int, max_years: int) -> float:
    """How well the candidate's experience matches the range."""
    if resume_years >= min_years and resume_years <= max_years:
        return 100.0
    if resume_years < min_years:
        shortfall = min_years - resume_years
        # Lose 15 points per missing year, floor at 20
        return max(20.0, 100.0 - shortfall * 15)
    # Over-qualified: minor deduction
    excess = resume_years - max_years
    return max(70.0, 100.0 - excess * 3)


def _education_score(resume_level: str, required_level: str) -> float:
    resume_rank = EDUCATION_RANK.get(resume_level, 0)
    required_rank = EDUCATION_RANK.get(required_level, 0)
    if resume_rank >= required_rank:
        return 100.0
    # 20 points lost per education level below requirement
    gap = required_rank - resume_rank
    return max(0.0, 100.0 - gap * 20)


def _title_relevance_score(detected_titles: List[str], category: str, job_title: str) -> float:
    """Boost score when the candidate's prior job titles overlap with the role category."""
    keywords = CATEGORY_TITLE_KEYWORDS.get(category, [])
    job_title_lower = job_title.lower()

    all_candidate_text = " ".join(detected_titles).lower()

    matches = sum(1 for kw in keywords if kw in all_candidate_text)
    job_match = any(kw in job_title_lower for kw in all_candidate_text.split())

    if not keywords:
        return 50.0

    base = (matches / len(keywords)) * 100
    if job_match:
        base = min(base + 15, 100)
    return min(base, 100.0)


def match_jobs(resume_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Return all jobs sorted by weighted match percentage (descending)."""
    resume_skills = resume_data.get("skills", [])
    resume_years = resume_data.get("experience_years", 0)
    resume_education = resume_data.get("education_level", "bachelor")
    detected_titles = resume_data.get("detected_titles", [])

    results = []

    for job in JOBS:
        # Individual dimension scores
        s_score = _skills_score(resume_skills, job["required_skills"], job["preferred_skills"])
        e_score = _experience_score(resume_years, job["experience_years_min"], job["experience_years_max"])
        edu_score = _education_score(resume_education, job["education_required"])
        t_score = _title_relevance_score(detected_titles, job["category"], job["title"])

        # Weighted average
        overall = (
            s_score * 0.50
            + e_score * 0.20
            + edu_score * 0.15
            + t_score * 0.15
        )

        # Clamp
        overall = round(min(max(overall, 0), 100), 1)

        # Identify matching skills for display
        resume_lower = {sk.lower() for sk in resume_skills}
        matching_skills = [s for s in job["required_skills"] if s.lower() in resume_lower]
        matching_skills += [s for s in job["preferred_skills"] if s.lower() in resume_lower]
        # Deduplicate
        seen = set()
        unique_matching = []
        for ms in matching_skills:
            if ms.lower() not in seen:
                seen.add(ms.lower())
                unique_matching.append(ms)

        results.append({
            "id": job["id"],
            "title": job["title"],
            "company": job["company"],
            "source": job["source"],
            "location": job["location"],
            "job_type": job["job_type"],
            "salary_range": job["salary_range"],
            "category": job["category"],
            "description": job["description"],
            "required_skills": job["required_skills"],
            "matching_skills": unique_matching[:8],  # top 8 for display
            "match_percentage": overall,
            "skills_score": round(s_score, 1),
            "experience_score": round(e_score, 1),
            "education_score": round(edu_score, 1),
        })

    # Sort by match percentage descending
    results.sort(key=lambda x: x["match_percentage"], reverse=True)
    return results
