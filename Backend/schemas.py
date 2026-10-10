from pydantic import BaseModel


# ============================================================
# SCHEMA — SINGLE COMBINED REPORT (GOOGLE ADK AGENT OUTPUT)
# ============================================================

class MapsListingResult(BaseModel):
    name: str = ""
    address: str = ""
    place_id: str = ""
    google_maps_url: str = ""


class AdvertisementItem(BaseModel):
    advertiser: str = ""
    headline: str = ""
    description: str = ""
    displayed_domain: str = ""
    destination_url: str = ""
    relevance_explanation: str = ""
    suspicion_status: str = "No Suspicious Evidence Found"
    reasoning: str = ""


class CompetitorItem(BaseModel):
    brand_name: str = ""
    why_it_competes: str = ""
    suspicion_status: str = "No Suspicious Evidence Found"
    evidence_and_reasoning: str = ""
    reasoning: str = ""


class OrganicResultItem(BaseModel):
    position: int = 1
    title: str = ""
    url: str = ""
    domain: str = ""
    type: str = "Organic"
    relevance_status: str = "Relevant to the investigated brand"
    snippet: str = ""
    reason: str = ""


class BrandInvestigationResult(BaseModel):
    search_queries: list[str] = []
    investigation_location: str = ""
    owner_website_status: str = ""
    organic_findings: str = ""
    organic_results: list[OrganicResultItem] = []
    advertisement_findings: str = ""
    advertisements: list[AdvertisementItem] = []
    potential_competitors: list[CompetitorItem] = []
    maps_findings: str = ""
    maps_results: list[MapsListingResult] = []
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
    organic_results: list[OrganicResultItem] = []
    advertisement_findings: str = ""
    advertisements: list[AdvertisementItem] = []
    potential_competitors: list[CompetitorItem] = []
    maps_findings: str = ""
    maps_results: list[MapsListingResult] = []
    news_findings: str = ""
    anomaly_detected: bool = False
    overall_signal: str = "CONFIRMED"
    executive_summary: str = ""
    explanation: str = ""
    source_links: list[str] = []
    web_search_report: str = ""