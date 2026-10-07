from pydantic import BaseModel


# ============================================================
# SCHEMA — SINGLE COMBINED REPORT (GOOGLE ADK AGENT OUTPUT)
# ============================================================

class BrandInvestigationResult(BaseModel):
    search_queries: list[str] = []
    investigation_location: str = ""
    owner_website_status: str = ""
    organic_findings: str = ""
    advertisement_findings: str = ""
    maps_findings: str = ""
    news_findings: str = ""
    anomaly_detected: bool = False
    overall_signal: str = "CONFIRMED"
    executive_summary: str = ""
    explanation: str = ""
    source_links: list[str] = []
    web_search_report: str = ""


# ============================================================
# SCHEMA — HTTP API REQUEST & RESPONSE CONTRACT
# ============================================================

class InvestigationRequest(BaseModel):
    company_name: str
    website: str = ""
    location: str


class InvestigationResponse(BaseModel):
    brand: str
    company_name: str
    location: str
    investigation_location: str
    website: str = ""
    search_queries: list[str] = []
    owner_website_status: str = ""
    organic_findings: str = ""
    advertisement_findings: str = ""
    maps_findings: str = ""
    news_findings: str = ""
    anomaly_detected: bool = False
    overall_signal: str = "CONFIRMED"
    executive_summary: str = ""
    explanation: str = ""
    source_links: list[str] = []
    web_search_report: str = ""