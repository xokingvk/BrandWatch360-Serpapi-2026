from pydantic import BaseModel


# ============================================================
# SCHEMA — SINGLE COMBINED REPORT
# ============================================================

class BrandInvestigationResult(BaseModel):
    search_queries: list[str]
    investigation_location: str
    owner_website_status: str
    organic_findings: str
    advertisement_findings: str
    maps_findings: str
    news_findings: str
    anomaly_detected: bool
    explanation: str
    source_links: list[str]