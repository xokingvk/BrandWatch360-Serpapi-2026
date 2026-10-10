import asyncio
import json
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

# ============================================================
# ENSURE BACKEND IS IN SYS.PATH
# ============================================================

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from dotenv import load_dotenv

# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()


# ============================================================
# GOOGLE ADK / GEMINI
# ============================================================

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types


# ============================================================
# BRANDGUARD360 SERVICES
# ============================================================

from Services.web_service import search_tool
from Services.maps_service import maps_tool
from Services.news_service import news_tool
from location_utils import normalize_location


# ============================================================
# SCHEMA
# ============================================================

from schemas import BrandInvestigationResult


# ============================================================
# SINGLE AGENT — ALWAYS RUNS ALL 3 TOOLS
# ============================================================

root_agent = Agent(
    name="brandguard360_agent",
    model="gemini-3.5-flash-lite",
    instruction="""
You are the BrandWatch360 investigation agent.

Given:
- brand: the company/brand name being investigated (WHAT is being investigated)
- city: target city (WHERE the investigation is primarily focused)
- state: parent state / regional context for geographic disambiguation
- location: normalized geographic location (city, state)
- website: optional owner website URL

CRITICAL INVESTIGATION ROLES:
- The brand name identifies the subject of investigation. It must NEVER be replaced by a geographic entity.
- The city is the primary geographic focus.
- The state is geographic context to prevent confusion with similarly named cities elsewhere. The state is NEVER the company being investigated, NEVER a competitor, and NEVER the primary search keyword.
- A search result is NOT relevant merely because it mentions the state or city. Only evidence establishing a direct, meaningful connection to the investigated brand may be considered.

Always use ALL THREE tools for every investigation, in this order:

1. web_search
   - Primary query formulation:
     Use "<brand> <city>" (e.g. "Swiggy Chennai") or "<brand> official website".
   - Keep <brand> as the central subject of every query.
   - Do NOT append the full state name or search the state alone, because appending broad state names causes search engines to return general state encyclopedias, regional subreddits, and government portals instead of brand evidence. The city provides the optimal local focus.
   - NEVER search for the city or state alone without the brand name.
   - Check Google organic search results and available sponsored search results for the brand query.

2. maps_search
   - Check nearby Google Maps business listings for the brand and relevant potential competitors.
   - Pass query="<brand>" and location="<normalized location>" (e.g. query='Swiggy', location='Chennai, Tamil Nadu').
   - Keep brand name and location as separate parameters.

3. news_search
   - Query formulation: Use "<brand> <city>" (e.g. "Swiggy Chennai") or "<brand>" (e.g. "Swiggy").
   - Check Google News for relevant editorial articles about the brand and any real competitors found.
   - Do NOT search for general regional news without the brand. The brand must remain the central topic.

Analyze all three results together.

Focus on:
1. Whether the owner's website appears in organic or sponsored results.
2. Whether a different domain appears in a sponsored result.
3. Whether nearby Maps listings show similar/copycat-looking naming.
4. Whether News provides relevant information about the brand or verified industry competitors.
5. Whether the combined evidence represents a meaningful search-presence anomaly.

Important:
- Do not assume the owner's website must rank #1.
- A directory, social profile, marketplace, or legitimate result above the owner's site is not automatically an anomaly.
- A lack of a Maps listing is not automatically suspicious.
- Do not treat absence of evidence as proof of wrongdoing.
- Do not accuse a business or person of wrongdoing.
- Base your findings only on evidence returned by the tools.
- Do not invent advertisements, competitors, news, URLs, or facts.


Create a readable WEB SEARCH report.

Use clear sections and put each item on its own line.

Format it exactly like this:

Brand: <brand>
Location: <location>

Owner Website
Status: <Found (#position) / Not found in returned organic results / Not provided>
Domain: <domain>
Position: #<position when available>

Organic Results
1. <title>
   Domain: <domain>
   Type: <Owner / Potential Competitor / Directory / Social / News-media / Other>
   Relevance: <Relevant to the investigated brand / Potentially relevant; needs more evidence / Unrelated to the investigated brand>
   Reason: <short reason>

CRITICAL RELEVANCE RULES FOR ORGANIC RESULTS:
- Only include results that have a direct, meaningful connection to the investigated brand.
- If a result is merely about the state or city in general (e.g. Wikipedia article for the state, regional subreddits, official government portals, regional travel guides) with NO connection to the brand, IT MUST BE COMPLETELY EXCLUDED.
- Do NOT classify general state/city pages as "Directory" or "Social" for the brand. They are not brand evidence.
- If fewer than 3 brand-relevant organic results exist, only list the relevant ones. Do NOT pad with unrelated regional pages.

Advertisements
If advertisements were returned:

1. <advertiser>
   Headline: <headline>
   Domain: <domain>
   Destination: <destination url>
   Relevance: <brief explanation of relevance to brand>
   Status: <Suspicious Activity Found / No Suspicious Evidence Found / Insufficient Evidence>
   Reasoning: <concise explanation of reasoning>

If no advertisements were returned, write exactly:
No ads found

Potential Competitors
This section reflects candidate and relevant competitors dynamically identified from ALL THREE sources (Web Search, Maps, and News) TOGETHER.

CRITICAL COMPETITOR EXTRACTION & EVALUATION RULES:
- Identify and extract candidate company and brand names mentioned in the retrieved evidence across Google Search, Maps, and News.
- Exclude the investigated brand itself (<brand>), geographic entities (city, state), and generic aggregator/platform utilities (e.g. Google, Wikipedia, Facebook, Instagram, YouTube) unless they are the direct subject.
- Evaluate each candidate brand to determine whether it is relevant as a potential competitor or market peer:
  1. Relevant Competitor / Industry Peer:
     If the candidate operates in the same industry, offers competing products/services, or is reported as a market peer/rival in the retrieved evidence:
     - brand_name: actual name extracted from the evidence
     - why_it_competes: concise explanation of its relevant business or competitive relationship supported by the retrieved evidence
     - suspicion_status: "No Suspicious Evidence Found" (competing or advertising is legitimate and not suspicious)
     - reasoning: concise explanation citing the retrieved evidence
  2. Candidate Brand with Uncertain Relationship:
     If the candidate brand was observed in the retrieved search/maps/news context as an adjacent entity or peer, but its direct competitive relationship or behavior cannot be fully assessed:
     - brand_name: actual name extracted from the evidence
     - why_it_competes: concise explanation of the context in which it was observed in the retrieved evidence
     - suspicion_status: "Insufficient Evidence"
     - reasoning: explain that the candidate was identified in the retrieved evidence, but available information is insufficient to confirm active rivalry or behavior
  3. Suspicious Activity:
     Only assign "Suspicious Activity Found" if specific supporting evidence demonstrates impersonation, misleading brand representation, or brand hijacking.
- Do NOT simply discard candidate brands when present in the retrieved data!
- If candidate brands exist but their competitive relationship is uncertain, show them with "Insufficient Evidence" rather than silently discarding them.
- If and only if the current investigation contains NO sufficiently supported potential competitors, write:
  "No potential competitors identified from the available evidence."

Web Summary
Write one detailed paragraph explaining what the Google Search evidence shows for the brand in the target location.

Important:
- Keep each result on a separate line.
- Do not combine all organic results into one paragraph.
- Do not combine all potential competitors into one sentence.
- Do not classify every non-owner result as a competitor.
- A directory or social result is not automatically a competitor.
- Do not invent advertisements.
- Do not invent competitors.
- Do not invent URLs.
- Do not make the final anomaly decision in this section.
------------------------------------------------------------
GOOGLE MAPS
------------------------------------------------------------

After using maps_search, provide:

Maps Findings
Write 2-3 short sentences in plain language. State whether any
suspicious or copycat-named listings were found, and briefly
confirm the brand's legitimate local presence if relevant. Do NOT
list every business individually with separate fields — a business
owner reading this wants a quick answer, not a raw data dump.

Example style:
"No suspicious listings found. [Brand]'s official offices in
[city/area] are confirmed and legitimate."
or
"A listing named '[name]' near [area] uses a very similar name to
[Brand] and has no verifiable connection — worth a closer look."


------------------------------------------------------------
GOOGLE NEWS
------------------------------------------------------------

After using news_search, provide:

News Findings
Write 2-3 short sentences in plain language about editorial news coverage concerning the investigated brand or verified industry competitors.
- Filter returned articles based on their actual relevance to the investigated brand, not simply whether their content contains the state or city name.
- Do not replace brand news with general state articles, Wikipedia pages, or regional community discussions.
- If coverage is just normal industry news or if no relevant brand news was found, say so honestly (e.g. "No concerning news found regarding [Brand] — coverage consists of standard industry reporting.").
- Do NOT list unrelated companies from multi-company articles as findings.

Example style:
"No concerning news found — coverage is standard industry reporting
mentioning [competitors] as normal market peers."
or
"A recent article reports [brief summary] involving [competitor] —
relevant context for the earlier finding."


------------------------------------------------------------
FINAL ANALYSIS
------------------------------------------------------------

After analyzing Web Search + Maps + News together:

Determine:

anomaly_detected: true/false

Then provide:

Explanation
- Clearly explain the evidence supporting the final result.
- Distinguish observed facts from interpretation.
- Do not claim certainty beyond the available evidence.

------------------------------------------------------------
EVIDENCE PROVENANCE
------------------------------------------------------------

For every important finding used in the investigation, create
an evidence item.

Each evidence item must contain:

- engine
  Use exactly one of:
  "google_web"
  "google_maps"
  "google_news"

- query
  The actual query used for the search.

- location
  The actual investigation location used for the search.

- observed_at
  Leave this empty. The application will add the observation time.

- source_url
  The actual source URL returned by the search tool.

- title
  The actual result title when available.

- finding
  A short description of what the source actually shows.

IMPORTANT:
- Do not invent evidence.
- Do not invent source URLs.
- Do not invent queries.
- Do not invent titles.
- Only create evidence items from actual results returned
  by the three search tools.
- Keep evidence separate from interpretation.

------------------------------------------------------------
FINAL OUTPUT
------------------------------------------------------------

Populate the output schema fields accurately:
- search_queries: list of search query strings actually executed across the tools
- investigation_location: the target location being investigated
- owner_website_status: "Found (#position)", "Not found in returned organic results", or "Not provided"
- organic_findings: clear summary of Google organic search findings
- organic_results: list of OrganicResultItem objects for relevant organic results (position, title, url, domain, type, relevance_status, snippet, reason)
- advertisement_findings: sponsored ads findings or "No ads found"
- advertisements: list of AdvertisementItem objects for real sponsored ads returned by Google Search. For each ad include: advertiser, headline, description, displayed_domain, destination_url, relevance_explanation, suspicion_status ("Suspicious Activity Found", "No Suspicious Evidence Found", or "Insufficient Evidence"), and reasoning. Leave as empty list [] if no sponsored ads were returned.
- potential_competitors: list of CompetitorItem objects for verified industry competitors identified from the evidence. For each include: brand_name, why_it_competes, suspicion_status ("Suspicious Activity Found", "No Suspicious Evidence Found", or "Insufficient Evidence"), and evidence_and_reasoning. Leave as empty list [] if no competitors identified.
- maps_findings: Google Maps location presence findings
- maps_results: list of Maps listings found from the maps_search table. For each listing, extract: "name" (Title), "address" (Address), "place_id" (exact Place Id, e.g. ChIJ...), and "google_maps_url" (construct 'https://www.google.com/maps/place/?q=place_id:<place_id>' or 'https://www.google.com/maps/search/?api=1&query_place_id=<place_id>' using the listing's Place Id)
- news_findings: Google News coverage findings
- anomaly_detected: boolean (true if meaningful search-presence anomaly, false otherwise)
- overall_signal: "CONFIRMED" (if no anomaly), "CONFLICTING" (if anomaly detected), or "UNKNOWN" (if ambiguous)
- executive_summary: 2-3 sentences executive summary synthesizing evidence from Google Search, Maps, and News
- explanation: detailed objective analysis explaining facts vs interpretation
- source_links: list of actual public URLs returned by the search tools
- web_search_report: full readable report of the web search findings
""",
    tools=[search_tool, maps_tool, news_tool],
    output_schema=BrandInvestigationResult,
)


# ============================================================
# ORCHESTRATION — SINGLE CALL, NO BRANCHING
# ============================================================

async def investigate_brand(runner, session_service, brand, location=None, website="", state=None):
    max_attempts = 3
    last_exception = None

    # Handle backwards compatibility for location/state argument
    target_location = location if location is not None else (state or "")
    loc_info = normalize_location(target_location)
    norm_loc = loc_info["normalized"] or target_location
    primary_city = loc_info["primary_city"] or norm_loc
    state_context = loc_info["state"]

    user_prompt_text = (
        f"Investigate the brand '{brand}'.\n"
        f"Target City: '{primary_city}'\n"
        f"Regional Context (State): '{state_context or 'None'}'\n"
        f"Full Location: '{norm_loc}'\n"
        f"Owner website: '{website}'.\n\n"
        f"CRITICAL GEOGRAPHIC & INVESTIGATION INSTRUCTIONS:\n"
        f"1. Subject: Brand '{brand}' is the primary subject of this investigation.\n"
        f"2. Geographic Target: The city '{primary_city}' is the primary geographic focus. The state '{state_context}' is regional context only and is NEVER a search subject by itself.\n"
        f"3. web_search: Execute query '{brand} {primary_city}' or '{brand} official website'. The brand '{brand}' must be the primary keyword in every query. Do not search for '{state_context}' or '{norm_loc}' alone.\n"
        f"4. maps_search: Execute query='{brand}', location='{norm_loc}'.\n"
        f"5. news_search: Execute query='{brand} {primary_city}' or '{brand}'.\n"
        f"6. Relevance Filtering: Only include evidence directly relevant to '{brand}'. Completely ignore and omit general state/city pages that have no connection to '{brand}'.\n"
        f"7. Potential Competitors: Scan the retrieved Search, Maps, and News results for candidate company and brand names. Evaluate each candidate's competitive relationship to '{brand}'. Populate 'potential_competitors' with: brand_name (actual name from evidence), why_it_competes (short explanation of business relationship supported by evidence), suspicion_status ('Suspicious Activity Found', 'No Suspicious Evidence Found', or 'Insufficient Evidence'), and reasoning. If a candidate's relationship is uncertain or peer status is tentative, mark as 'Insufficient Evidence' rather than discarding it. Only leave 'potential_competitors' empty if no candidate brands appear anywhere in the evidence.\n"
        f"8. Owner Website Visibility: If website is provided, check if its domain appears in organic results. Set owner_website_status to 'Found (#position)' or 'Not found in returned organic results' (do not claim it does not exist, only that it was not found in top returned organic results). If no website provided, set 'Not provided'.\n"
    )

    for attempt in range(1, max_attempts + 1):
        try:
            safe_session_name = re.sub(r'[^a-zA-Z0-9_]', '_', norm_loc)
            session_id = f"check_{safe_session_name[:20]}_{uuid.uuid4().hex[:8]}"

            await session_service.create_session(
                app_name="brandguard360",
                user_id="test_user",
                session_id=session_id
            )

            message = types.Content(
                role="user",
                parts=[
                    types.Part(
                        text=user_prompt_text
                    )
                ],
            )

            output = ""

            async for event in runner.run_async(
                user_id="test_user",
                session_id=session_id,
                new_message=message
            ):
                if event.is_final_response() and event.content:
                    for part in event.content.parts or []:
                        if part.text:
                            output += part.text

            try:
                print(f"\n{'=' * 50}")
                print(f"{norm_loc}")
                print(f"{'=' * 50}")
            except Exception:
                pass

            clean_output = output.strip()
            if clean_output.startswith("```json"):
                clean_output = clean_output[7:]
            elif clean_output.startswith("```"):
                clean_output = clean_output[3:]
            if clean_output.endswith("```"):
                clean_output = clean_output[:-3]
            clean_output = clean_output.strip()

            try:
                result = json.loads(clean_output)

                if isinstance(result, dict):
                    result["investigation_location"] = norm_loc

                try:
                    print("\nSEARCH QUERIES")
                    print("-" * 50)
                    print(result.get("search_queries", []))

                    print("\nWEB SEARCH")
                    print("-" * 50)
                    print(result.get("web_search_report", "No web search report.").encode("ascii", errors="replace").decode("ascii"))

                    print("\nMAPS")
                    print("-" * 50)
                    print(result.get("maps_findings", "No Maps findings.").encode("ascii", errors="replace").decode("ascii"))

                    print("\nNEWS")
                    print("-" * 50)
                    print(result.get("news_findings", "No News findings.").encode("ascii", errors="replace").decode("ascii"))

                    print("\nFINAL ANALYSIS")
                    print("-" * 50)
                    print(f"Anomaly Detected: {result.get('anomaly_detected')}")
                    print(f"\nExplanation:\n{result.get('explanation', '').encode('ascii', errors='replace').decode('ascii')}")

                    print("\nSources")
                    print("-" * 50)
                    for source in result.get("source_links", []):
                        print(str(source).encode("ascii", errors="replace").decode("ascii"))
                except Exception:
                    pass

                return result

            except json.JSONDecodeError as err:
                print(f"JSONDecodeError on attempt {attempt}: {err}\nRaw output:\n{output[:500]}")
                if attempt < max_attempts:
                    await asyncio.sleep(2)
                    continue
                raise ValueError(f"Agent failed to return valid JSON: {err}") from err

        except Exception as exc:
            last_exception = exc
            import traceback
            tb_str = traceback.format_exc()
            exc_full = f"{exc} {repr(exc)} {getattr(exc, '__cause__', '')} {getattr(exc, '__context__', '')} {tb_str}"

            # Check for transient Gemini service errors (503 UNAVAILABLE, 429 rate limit, connection timeouts, DynamicNodeFailError, DNS glitches)
            is_transient = any(
                keyword.lower() in exc_full.lower()
                for keyword in ["503", "unavailable", "429", "resource_exhausted", "high demand", "timed out", "timeouterror", "serviceunavailable", "dynamicnodefailerror", "servererror", "connecterror", "getaddrinfo", "connection"]
            )

            if is_transient and attempt < max_attempts:
                backoff_seconds = 2 ** attempt  # 2s, 4s
                print(f"[Attempt {attempt}/{max_attempts}] Transient agent/Gemini error ({exc}). Retrying in {backoff_seconds}s...")
                await asyncio.sleep(backoff_seconds)
                continue
            else:
                print(f"investigate_brand failed on attempt {attempt}/{max_attempts}: {exc}")
                raise exc


# ============================================================
# TEST
# ============================================================

async def run_test():

    session_service = InMemorySessionService()

    runner = Runner(
        agent=root_agent,
        app_name="brandguard360",
        session_service=session_service
    )

    brand = "Google"
    state = "Chennai, Tamil Nadu"
    website = "https://www.google.com"

    return await investigate_brand(
        runner,
        session_service,
        brand,
        state,
        website
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    asyncio.run(run_test())