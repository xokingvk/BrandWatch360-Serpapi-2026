import logging
import os
import re
import sys
import uuid
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

from urllib.parse import quote
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

from agent import root_agent, investigate_brand
from location_utils import normalize_location
from domain_utils import is_domain_match, normalize_domain
from schemas import (
    InvestigationRequest,
    InvestigationResponse,
    AdvertisementItem,
    CompetitorItem,
    OrganicResultItem,
)


def normalize_suspicion_status(status_str: str) -> str:
    """
    Normalizes suspicion classification to one of the three required statuses:
    - Suspicious Activity Found
    - No Suspicious Evidence Found
    - Insufficient Evidence
    """
    s = (status_str or "").strip().lower()
    if "suspicious activity" in s or ("suspicious" in s and "no suspicious" not in s):
        return "Suspicious Activity Found"
    elif "no suspicious" in s or "not suspicious" in s or "confirmed" in s or "clean" in s or "legitimate" in s:
        return "No Suspicious Evidence Found"
    elif "insufficient" in s or "unknown" in s or "inconclusive" in s:
        return "Insufficient Evidence"
    return "No Suspicious Evidence Found"

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
    request_id = f"inv_{uuid.uuid4().hex[:8]}"
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

    loc_info = normalize_location(location)
    logger.info(
        "[%s] Starting brand investigation for '%s' in '%s' (normalized: '%s', website: '%s')",
        request_id, company_name, location, loc_info["normalized"], website or "None"
    )

    try:
        raw_result = await investigate_brand(
            runner=runner,
            session_service=session_service,
            brand=company_name,
            location=location,
            website=website
        )

        if not raw_result or not isinstance(raw_result, dict):
            raise ValueError("Invalid investigation result returned by backend agent.")

        # Structure response conforming to InvestigationResponse
        investigation_location = str(raw_result.get("investigation_location") or loc_info["normalized"] or location).strip()
        overall_sig = str(raw_result.get("overall_signal") or ("CONFLICTING" if raw_result.get("anomaly_detected") else "CONFIRMED")).strip()
        exec_summary = str(raw_result.get("executive_summary") or raw_result.get("explanation", "")).strip()

        # Maps results
        raw_maps_results = raw_result.get("maps_results", [])
        maps_res = []
        if isinstance(raw_maps_results, list):
            for item in raw_maps_results:
                if isinstance(item, dict):
                    name = str(item.get("name", "")).strip()
                    g_url = str(item.get("google_maps_url", "")).strip()
                    p_id = str(item.get("place_id", "")).strip()
                    addr = str(item.get("address", "")).strip()
                elif hasattr(item, "name"):
                    name = str(getattr(item, "name", "")).strip()
                    g_url = str(getattr(item, "google_maps_url", "")).strip()
                    p_id = str(getattr(item, "place_id", "")).strip()
                    addr = str(getattr(item, "address", "")).strip()
                else:
                    continue

                if p_id and (not g_url or "/maps/search" in g_url and "query_place_id" not in g_url):
                    g_url = f"https://www.google.com/maps/place/?q=place_id:{p_id}"
                elif not g_url and name:
                    loc_target = addr or investigation_location or location
                    g_url = f"https://www.google.com/maps/search/?api=1&query={quote(f'{name}, {loc_target}')}"

                if name or g_url or p_id:
                    maps_res.append({
                        "name": name,
                        "address": addr,
                        "place_id": p_id,
                        "google_maps_url": g_url,
                    })

        # Organic search results
        raw_orgs = raw_result.get("organic_results", [])
        org_res = []
        if isinstance(raw_orgs, list):
            for org in raw_orgs:
                if isinstance(org, dict):
                    pos = int(org.get("position", len(org_res) + 1))
                    otitle = str(org.get("title", "")).strip()
                    ourl = str(org.get("url", "")).strip()
                    odom = str(org.get("domain", "")).strip()
                    otype = str(org.get("type", "Organic")).strip()
                    orel = str(org.get("relevance_status", "Relevant to the investigated brand")).strip()
                    osnip = str(org.get("snippet", "")).strip()
                    oreas = str(org.get("reason", "")).strip()
                elif hasattr(org, "title"):
                    pos = int(getattr(org, "position", len(org_res) + 1))
                    otitle = str(getattr(org, "title", "")).strip()
                    ourl = str(getattr(org, "url", "")).strip()
                    odom = str(getattr(org, "domain", "")).strip()
                    otype = str(getattr(org, "type", "Organic")).strip()
                    orel = str(getattr(org, "relevance_status", "Relevant to the investigated brand")).strip()
                    osnip = str(getattr(org, "snippet", "")).strip()
                    oreas = str(getattr(org, "reason", "")).strip()
                else:
                    continue

                if otitle or odom or ourl:
                    org_res.append({
                        "position": pos,
                        "title": otitle,
                        "url": ourl,
                        "domain": odom,
                        "type": otype or "Organic",
                        "relevance_status": orel,
                        "snippet": osnip or oreas or otitle,
                        "reason": oreas or osnip,
                    })

        # Owner Website Verification — Distinguish presence from search visibility
        if website:
            matched_pos = None
            for org in org_res:
                if is_domain_match(website, org.get("domain", "")) or is_domain_match(website, org.get("url", "")):
                    matched_pos = org.get("position", 1)
                    break
            if matched_pos is not None:
                owner_status = f"Found (#{matched_pos})"
            else:
                matched_source = False
                for s_link in raw_result.get("source_links", []):
                    if is_domain_match(website, s_link):
                        matched_source = True
                        break
                if matched_source:
                    owner_status = "Found (#1)"
                else:
                    owner_status = "Not found in returned organic results"
        else:
            owner_status = "Not provided"

        # Advertisements — Real sponsored ads returned by investigation
        raw_ads = raw_result.get("advertisements", [])
        ad_res = []
        if isinstance(raw_ads, list):
            for ad in raw_ads:
                if isinstance(ad, dict):
                    adv = str(ad.get("advertiser", "")).strip()
                    head = str(ad.get("headline", "")).strip()
                    desc = str(ad.get("description", "")).strip()
                    dom = str(ad.get("displayed_domain", ad.get("domain", ""))).strip()
                    dest = str(ad.get("destination_url", ad.get("url", ""))).strip()
                    rel = str(ad.get("relevance_explanation", "")).strip()
                    status_raw = str(ad.get("suspicion_status", "No Suspicious Evidence Found")).strip()
                    reas = str(ad.get("reasoning", "")).strip()
                elif hasattr(ad, "advertiser"):
                    adv = str(getattr(ad, "advertiser", "")).strip()
                    head = str(getattr(ad, "headline", "")).strip()
                    desc = str(getattr(ad, "description", "")).strip()
                    dom = str(getattr(ad, "displayed_domain", "")).strip()
                    dest = str(getattr(ad, "destination_url", "")).strip()
                    rel = str(getattr(ad, "relevance_explanation", "")).strip()
                    status_raw = str(getattr(ad, "suspicion_status", "No Suspicious Evidence Found")).strip()
                    reas = str(getattr(ad, "reasoning", "")).strip()
                else:
                    continue

                if adv or head or dom or dest:
                    ad_res.append({
                        "advertiser": adv or dom or "Sponsored Advertiser",
                        "headline": head or adv,
                        "description": desc or rel,
                        "displayed_domain": dom,
                        "destination_url": dest,
                        "relevance_explanation": rel or f"Appeared as a sponsored advertisement for '{company_name}'.",
                        "suspicion_status": normalize_suspicion_status(status_raw),
                        "reasoning": reas or "Evaluated based on advertiser identity and destination URL.",
                    })

        # Potential Competitors — Candidate & verified real market competitors
        raw_comps = raw_result.get("potential_competitors", [])
        comp_res = []

        if isinstance(raw_comps, list) and len(raw_comps) > 0:
            for comp in raw_comps:
                if isinstance(comp, dict):
                    bname = str(comp.get("brand_name", comp.get("name", ""))).strip()
                    why = str(comp.get("why_it_competes", "")).strip()
                    status_raw = str(comp.get("suspicion_status", "No Suspicious Evidence Found")).strip()
                    ev = str(comp.get("reasoning", comp.get("evidence_and_reasoning", comp.get("note", "")))).strip()
                elif hasattr(comp, "brand_name"):
                    bname = str(getattr(comp, "brand_name", "")).strip()
                    why = str(getattr(comp, "why_it_competes", "")).strip()
                    status_raw = str(getattr(comp, "suspicion_status", "No Suspicious Evidence Found")).strip()
                    ev = str(getattr(comp, "reasoning", getattr(comp, "evidence_and_reasoning", ""))).strip()
                else:
                    continue

                if bname and not bname.lower().startswith("none") and not bname.lower().startswith("no potential"):
                    comp_res.append({
                        "brand_name": bname,
                        "why_it_competes": why or f"Candidate competitor operating in the {company_name} market space.",
                        "suspicion_status": normalize_suspicion_status(status_raw),
                        "evidence_and_reasoning": ev or "Identified from investigation evidence.",
                        "reasoning": ev or "Identified from investigation evidence.",
                    })

        # Fallback: Check if competitors were documented in web_search_report or news text
        if not comp_res:
            try:
                report_text = str(raw_result.get("web_search_report", "") or "")
                comp_match = re.search(r"Potential Competitors[\s\S]*?(?=(?:Web Summary|\n---|\n===|$))", report_text, re.IGNORECASE)
                if comp_match:
                    comp_block = comp_match.group(0)
                    if not any(k in comp_block.lower() for k in ["no potential competitors", "none identified", "none"]):
                        blocks = re.split(r"\n(?=\d+\.\s*)", comp_block)[1:]
                        for blk in blocks:
                            lines = [l.strip() for l in blk.split("\n") if l.strip()]
                            if not lines:
                                continue
                            c_name = re.sub(r"^\d+\.\s*", "", lines[0]).strip()
                            why_m = re.search(r"Why:\s*([^\n]+)", blk, re.IGNORECASE)
                            st_m = re.search(r"Status:\s*([^\n]+)", blk, re.IGNORECASE)
                            reas_m = re.search(r"Reasoning:\s*([^\n]+)", blk, re.IGNORECASE)
                            if c_name and not c_name.lower().startswith("none") and not c_name.lower().startswith("no potential"):
                                comp_res.append({
                                    "brand_name": c_name,
                                    "why_it_competes": why_m.group(1).strip() if why_m else f"Candidate competitor identified in search results.",
                                    "suspicion_status": normalize_suspicion_status(st_m.group(1) if st_m else "No Suspicious Evidence Found"),
                                    "evidence_and_reasoning": reas_m.group(1).strip() if reas_m else "Identified from investigation evidence.",
                                    "reasoning": reas_m.group(1).strip() if reas_m else "Identified from investigation evidence.",
                                })
                        if not comp_res:
                            ment_m = re.search(r"Mentioned:\s*([^\n]+)", comp_block, re.IGNORECASE)
                            if ment_m:
                                raw_ment = ment_m.group(1).strip()
                                if raw_ment and not raw_ment.lower().startswith("none"):
                                    for cand in raw_ment.split(","):
                                        c_clean = cand.strip()
                                        if c_clean and not c_clean.lower().startswith("none"):
                                            comp_res.append({
                                                "brand_name": c_clean,
                                                "why_it_competes": f"Candidate brand mentioned in {company_name} investigation context.",
                                                "suspicion_status": "Insufficient Evidence",
                                                "evidence_and_reasoning": f"Observed in retrieved search evidence for {company_name}.",
                                                "reasoning": f"Observed in retrieved search evidence for {company_name}.",
                                            })
            except Exception as comp_err:
                logger.warning("[%s] Competitor fallback extraction warning: %s", request_id, comp_err)

        ad_findings = str(raw_result.get("advertisement_findings") or ("Observed sponsored advertisements." if ad_res else "No ads found"))

        response_data = {
            "brand": company_name,
            "company_name": company_name,
            "location": location,
            "investigation_location": investigation_location,
            "website": website,
            "search_queries": [str(q) for q in raw_result.get("search_queries", []) if q],
            "owner_website_status": owner_status,
            "organic_findings": str(raw_result.get("organic_findings") or raw_result.get("web_search_report", "")),
            "organic_results": org_res,
            "advertisement_findings": ad_findings,
            "advertisements": ad_res,
            "potential_competitors": comp_res,
            "maps_findings": str(raw_result.get("maps_findings", "")),
            "maps_results": maps_res,
            "news_findings": str(raw_result.get("news_findings", "")),
            "anomaly_detected": bool(raw_result.get("anomaly_detected", False)),
            "overall_signal": overall_sig,
            "executive_summary": exec_summary,
            "explanation": str(raw_result.get("explanation", "")),
            "source_links": [str(link) for link in raw_result.get("source_links", []) if link],
            "web_search_report": str(raw_result.get("web_search_report", "")),
        }

        logger.info(
            "[%s] Investigation completed successfully for '%s'. Overall signal: %s. Anomaly: %s. Sources: %d",
            request_id, company_name, response_data["overall_signal"], response_data["anomaly_detected"], len(response_data["source_links"])
        )

        return response_data

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("[%s] Investigation failed with unexpected error: %s", request_id, exc)
        exc_str = str(exc).lower()
        if any(k in exc_str for k in ["connecterror", "getaddrinfo", "timeout", "timed out", "connection error", "unavailable", "503"]):
            detail_msg = f"Upstream search services temporarily unavailable. Please try again in a few moments. (Ref: {request_id})"
        elif any(k in exc_str for k in ["api_key", "permission", "unauthorized", "quota", "resource_exhausted", "429"]):
            detail_msg = f"Investigation API service limits or authentication issue. (Ref: {request_id})"
        elif "invalid investigation result" in exc_str:
            detail_msg = f"Investigation model returned an unparseable response. Please retry. (Ref: {request_id})"
        else:
            detail_msg = f"Investigation could not be completed. Please try again. (Ref: {request_id})"

        # Never leak traceback, internal file paths, or API keys
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail_msg
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
