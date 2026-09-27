from pydantic import BaseModel


# ============================================================
# SCHEMA — SINGLE COMBINED REPORT
# ============================================================

class BrandInvestigationResult(BaseModel):
    web_search_report: str
    maps_findings: str
    news_findings: str
    anomaly_detected: bool
    explanation: str
    source_links: list[str]