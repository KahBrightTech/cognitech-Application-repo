# HirePath 🎯

AI-powered resume-to-job matching platform. Upload your resume (PDF or DOCX) and instantly see ranked job matches with percentage scores across **LinkedIn, Indeed, Glassdoor, Monster, and ZipRecruiter**.

---

## Quick Start – Docker (Local Testing)

```bash
# From the HirePath/ directory:
docker compose up --build
```

Then open **http://localhost** in your browser.

- Frontend → http://localhost (port 80)
- Backend API → http://localhost:8000/api/health

---

## How It Works

1. **Upload** your resume (PDF or DOCX)
2. The backend **parses** your skills, experience, and education
3. Jobs are **scored** across 5 simulated job boards using a weighted algorithm:
   - Skills match → 50%
   - Experience match → 20%
   - Education match → 15%
   - Title relevance → 15%
4. Results are ranked and displayed with filters for board, type, category, and minimum match %

---

## Project Structure

```
HirePath/
├── backend/
│   ├── main.py            # FastAPI app
│   ├── resume_parser.py   # PDF/DOCX text extraction + skill detection
│   ├── job_database.py    # 65+ job listings across 5 sources
│   ├── job_matcher.py     # Weighted matching algorithm
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── components/    # Navbar, Hero, Upload, Search, Results, Cards
│   ├── nginx.conf         # Proxies /api to backend
│   ├── Dockerfile         # Multi-stage: Node build → nginx serve
│   └── package.json
├── docker-compose.yml
└── .dockerignore
```

---

## Local Dev (without Docker)

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev        # Vite dev server on :5173, proxies /api to :8000
```

---

## Future Deployment (EKS + RDS)

When you're ready to deploy:
- Backend: containerise and push to ECR → deploy to EKS
- Frontend: same approach
- Database: migrate job listings to RDS PostgreSQL; update `job_database.py` → SQLAlchemy models
- Secrets: use AWS Secrets Manager / EKS environment variables
