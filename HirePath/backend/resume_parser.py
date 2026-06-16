import re
import io
from typing import Dict, Any, List

# ─────────────────────────────────────────────
#  Skill taxonomy
# ─────────────────────────────────────────────
SKILLS_LIST = [
    # Programming Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "golang",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl",
    "bash", "shell", "powershell", "sql", "nosql", "html", "css", "sass", "less",
    # Frontend Frameworks
    "react", "react.js", "reactjs", "angular", "vue", "vue.js", "vuejs",
    "next.js", "nextjs", "nuxt", "svelte", "jquery", "tailwind", "bootstrap",
    "material ui", "chakra ui", "styled components", "webpack", "vite",
    # Backend Frameworks
    "node.js", "nodejs", "express", "fastapi", "django", "flask", "spring",
    "spring boot", "rails", "ruby on rails", "laravel", "asp.net", ".net",
    "graphql", "rest", "restful", "grpc", "microservices",
    # Databases
    "mysql", "postgresql", "postgres", "mongodb", "redis", "cassandra",
    "dynamodb", "elasticsearch", "oracle", "sqlite", "firebase", "supabase",
    "snowflake", "bigquery", "redshift", "neo4j", "couchdb",
    # Cloud & DevOps
    "aws", "amazon web services", "azure", "gcp", "google cloud",
    "docker", "kubernetes", "k8s", "terraform", "ansible", "chef", "puppet",
    "jenkins", "github actions", "gitlab ci", "circleci", "travis ci",
    "ci/cd", "helm", "istio", "prometheus", "grafana", "datadog", "splunk",
    "nginx", "apache", "linux", "unix", "git", "github", "gitlab", "bitbucket",
    # Data Science & ML
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "tensorflow", "pytorch", "keras", "scikit-learn",
    "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly",
    "spark", "hadoop", "kafka", "airflow", "dbt", "looker", "tableau",
    "power bi", "excel", "data analysis", "data science", "statistics",
    "a/b testing", "etl", "data pipeline", "data warehouse",
    # Mobile
    "ios", "android", "react native", "flutter", "xcode", "android studio",
    # Security
    "cybersecurity", "penetration testing", "ethical hacking", "siem",
    "firewalls", "ssl", "tls", "oauth", "jwt", "iam", "soc",
    # Product & Design
    "product management", "product roadmap", "user research", "ux", "ui",
    "figma", "sketch", "adobe xd", "invision", "wireframing", "prototyping",
    "user stories", "agile", "scrum", "kanban", "jira", "confluence",
    # Marketing & Analytics
    "seo", "sem", "google analytics", "google ads", "facebook ads",
    "hubspot", "salesforce", "marketo", "mailchimp", "content marketing",
    "social media", "email marketing", "crm", "growth hacking",
    # Finance
    "financial modeling", "financial analysis", "bloomberg terminal",
    "quickbooks", "sap", "erp", "accounting", "gaap", "ifrs",
    "valuation", "dcf", "investment banking", "private equity", "hedge fund",
    # Project / Leadership
    "project management", "leadership", "strategic planning", "team management",
    "stakeholder management", "communication", "presentation", "negotiation",
]

# Normalised lookup set
SKILLS_SET = {s.lower() for s in SKILLS_LIST}

JOB_TITLES = [
    "software engineer", "software developer", "frontend developer",
    "backend developer", "full stack developer", "fullstack developer",
    "data scientist", "data analyst", "data engineer", "ml engineer",
    "machine learning engineer", "ai engineer", "devops engineer",
    "cloud engineer", "site reliability engineer", "sre",
    "product manager", "product owner", "ux designer", "ui designer",
    "ux/ui designer", "graphic designer", "web designer",
    "marketing manager", "digital marketer", "seo specialist",
    "content writer", "content marketer", "social media manager",
    "financial analyst", "accountant", "investment banker",
    "project manager", "program manager", "scrum master",
    "sales representative", "account executive", "business analyst",
    "hr manager", "recruiter", "talent acquisition",
    "nurse", "registered nurse", "physician", "doctor",
    "teacher", "professor", "researcher",
    "cybersecurity analyst", "information security",
    "mobile developer", "ios developer", "android developer",
    "database administrator", "systems administrator",
    "technical writer", "solutions architect",
]

EDUCATION_KEYWORDS = {
    "phd": ["phd", "ph.d", "doctorate", "doctoral"],
    "master": ["master", "m.s.", "m.sc", "msc", "mba", "m.b.a", "m.eng", "m.a."],
    "bachelor": ["bachelor", "b.s.", "b.sc", "bsc", "b.a.", "ba", "b.eng", "b.tech", "undergraduate", "college"],
    "associate": ["associate", "a.s.", "a.a."],
}


def extract_text_from_pdf(content: bytes) -> str:
    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)
    except Exception:
        return ""


def extract_text_from_docx(content: bytes) -> str:
    try:
        import docx
        doc = docx.Document(io.BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception:
        return ""


def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    found = []
    # Multi-word skills first (avoid substring matches)
    for skill in sorted(SKILLS_LIST, key=len, reverse=True):
        skill_lower = skill.lower()
        pattern = r'\b' + re.escape(skill_lower) + r'\b'
        if re.search(pattern, text_lower):
            found.append(skill)
    # Deduplicate while preserving order
    seen = set()
    unique = []
    for s in found:
        key = s.lower()
        if key not in seen:
            seen.add(key)
            unique.append(s)
    return unique


def extract_education_level(text: str) -> str:
    text_lower = text.lower()
    for level in ["phd", "master", "bachelor", "associate"]:
        for kw in EDUCATION_KEYWORDS[level]:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                return level
    return "high_school"


def extract_experience_years(text: str) -> int:
    """Estimate years of experience from patterns in the resume text."""
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*(?:professional\s*)?experience',
        r'(\d+)\+?\s*years?\s*(?:in|of)\s*(?:the\s*)?(?:industry|field|software|development|engineering)',
        r'experience[:\s]+(\d+)\+?\s*years?',
    ]
    years_found = []
    for pat in patterns:
        matches = re.findall(pat, text.lower())
        years_found.extend(int(m) for m in matches)

    if years_found:
        return max(years_found)

    # Fallback: count date ranges like "2019 – 2023" or "Jan 2020 - Present"
    date_ranges = re.findall(
        r'(20\d\d|19\d\d)\s*[-–—]\s*(20\d\d|present|current)',
        text.lower()
    )
    current_year = 2025
    total = 0
    for start, end in date_ranges:
        s = int(start)
        e = current_year if end in ("present", "current") else int(end)
        total += max(0, e - s)
    return min(total, 30)  # cap at 30


def extract_detected_titles(text: str) -> List[str]:
    text_lower = text.lower()
    return [t for t in JOB_TITLES if re.search(r'\b' + re.escape(t) + r'\b', text_lower)]


def parse_resume(content: bytes, filename: str) -> Dict[str, Any]:
    if filename.lower().endswith(".pdf"):
        raw_text = extract_text_from_pdf(content)
    elif filename.lower().endswith(".docx"):
        raw_text = extract_text_from_docx(content)
    else:
        raw_text = content.decode("utf-8", errors="ignore")

    skills = extract_skills(raw_text)
    education_level = extract_education_level(raw_text)
    experience_years = extract_experience_years(raw_text)
    detected_titles = extract_detected_titles(raw_text)

    return {
        "raw_text": raw_text,
        "skills": skills,
        "education_level": education_level,
        "experience_years": experience_years,
        "detected_titles": detected_titles,
    }
