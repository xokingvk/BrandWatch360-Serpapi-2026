import logging
import os
import sys
from pathlib import Path

# ============================================================
# ENSURE BACKEND DIRECTORY IN SYS.PATH
# ============================================================

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv

# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

from agent import root_agent, investigate_brand
from schemas import InvestigationRequest, InvestigationResponse

# ============================================================
# LOGGING SETUP
# ============================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("brandguard360")

# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="BrandGuard360 API",
    description="Evidence-based Brand Search-Presence Intelligence API",
    version="1.0.0"
)

# ============================================================
# CORS CONFIGURATION
# ============================================================

default_origins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]

env_origins = os.getenv("ALLOWED_ORIGINS", "")
if env_origins.strip():
    allowed_origins = [origin.strip() for origin in env_origins.split(",") if origin.strip()]
else:
    allowed_origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# SESSION SERVICE & RUNNER INITIALIZATION
# ============================================================

session_service = InMemorySessionService()
runner = Runner(
    agent=root_agent,
    app_name="brandguard360",
    session_service=session_service
)


# ============================================================
# HEALTH ENDPOINT
# ============================================================

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """
    Health check endpoint for local testing and deployment monitoring.
    Never exposes internal credentials or sensitive variables.
    """
    return {"status": "ok"}


# ============================================================
# INVESTIGATION ENDPOINT
# ============================================================

@app.post(
    "/api/investigate",
    response_model=InvestigationResponse,
    status_code=status.HTTP_200_OK
)
async def investigate(req: InvestigationRequest):
    """
    Execute BrandGuard360 investigation across Google Search, Maps, and News.
    Calls existing agent asynchronously and returns structured JSON evidence.
    """
    company_name = req.company_name.strip()
    location = req.location.strip()
    website = req.website.strip() if req.website else ""

    # Strict server-side validation
    if not company_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company name is required."
        )

    if not location:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location is required."
        )

    logger.info(
        "Starting brand investigation for '%s' in '%s' (website: '%s')",
        company_name, location, website or "None"
    )

    try:
        raw_result = await investigate_brand(
            runner=runner,
            session_service=session_service,
            brand=company_name,
            state=location,
            website=website
        )

        if not raw_result or not isinstance(raw_result, dict):
            raise ValueError("Invalid investigation result returned by backend agent.")

        # Structure response conforming to InvestigationResponse
        investigation_location = str(raw_result.get("investigation_location") or location).strip()
        owner_status = str(raw_result.get("owner_website_status") or ("Not provided" if not website else "Found")).strip()
        overall_sig = str(raw_result.get("overall_signal") or ("CONFLICTING" if raw_result.get("anomaly_detected") else "CONFIRMED")).strip()
        exec_summary = str(raw_result.get("executive_summary") or raw_result.get("explanation", "")).strip()

        response_data = {
            "brand": company_name,
            "company_name": company_name,
            "location": investigation_location,
            "investigation_location": investigation_location,
            "website": website,
            "search_queries": [str(q) for q in raw_result.get("search_queries", []) if q],
            "owner_website_status": owner_status,
            "organic_findings": str(raw_result.get("organic_findings") or raw_result.get("web_search_report", "")),
            "advertisement_findings": str(raw_result.get("advertisement_findings") or "No ads found"),
            "maps_findings": str(raw_result.get("maps_findings", "")),
            "news_findings": str(raw_result.get("news_findings", "")),
            "anomaly_detected": bool(raw_result.get("anomaly_detected", False)),
            "overall_signal": overall_sig,
            "executive_summary": exec_summary,
            "explanation": str(raw_result.get("explanation", "")),
            "source_links": [str(link) for link in raw_result.get("source_links", []) if link],
            "web_search_report": str(raw_result.get("web_search_report", "")),
        }

        logger.info(
            "Investigation completed successfully for '%s'. Overall signal: %s. Anomaly: %s. Sources: %d",
            company_name, response_data["overall_signal"], response_data["anomaly_detected"], len(response_data["source_links"])
        )

        return response_data

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Investigation failed with unexpected error: %s", exc)
        # Never leak traceback, internal file paths, or API keys
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Investigation could not be completed. Try again."
        )


# ============================================================
# ENTRY POINT (LOCAL & RENDER READY)
# ============================================================

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info("Starting BrandGuard360 FastAPI server on %s:%d", host, port)
    uvicorn.run("Backend.main:app", host=host, port=port, reload=True)
