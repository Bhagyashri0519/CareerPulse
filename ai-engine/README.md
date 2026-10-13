# AI Engine — CareerPulse

Python + FastAPI AI service for skill analysis, career matching, and roadmap generation.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # edit values
uvicorn app.main:app --reload --port 8000
```

## API Docs (when running)

- Swagger UI: http://localhost:8000/docs
- ReDoc:       http://localhost:8000/redoc
- Health:      http://localhost:8000/health

## Running Tests

```bash
pytest
```

## Planned Capabilities

- Resume parsing and skill extraction
- Skill normalization against taxonomy
- Skill-gap analysis
- Career-role matching score
- Personalized roadmap generation
- Learning resource recommendation
- Career readiness scoring
- LLM-powered career Q&A
