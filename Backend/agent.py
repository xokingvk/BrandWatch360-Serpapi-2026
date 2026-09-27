import asyncio
import json
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


# ============================================================
# SCHEMA
# ============================================================

from schemas import BrandInvestigationResult


# ============================================================
# SINGLE AGENT — ALWAYS RUNS ALL 3 TOOLS
# ============================================================

root_agent = Agent(
    name="brandguard360_agent",
    model="gemini-flash-lite-latest",
    instruction="""
You are the BrandGuard360 investigation agent.

Given:
- a brand name
- a state/city
- an optional owner website URL

Always use ALL THREE tools for every investigation, in this order:

1. web_search
   - Check Google organic search results and available sponsored
     search results for the brand query.

2. maps_search
   - Check nearby Google Maps business listings for the brand
     and relevant potential competitors.

3. news_search
   - Check Google News for relevant information about the brand
     and any potential competitor found during the investigation.

Analyze all three results together.

Focus on:
1. Whether the owner's website appears in organic or sponsored results.
2. Whether a different domain appears in a sponsored result.
3. Whether nearby Maps listings show similar/copycat-looking naming.
4. Whether News provides relevant information about the brand
   or identified potential competitors.
5. Whether the combined evidence represents a meaningful
   search-presence anomaly.

Important:
- Do not assume the owner's website must rank #1.
- A directory, social profile, marketplace, or legitimate result
  above the owner's site is not automatically an anomaly.
- A lack of a Maps listing is not automatically suspicious.
- Do not treat absence of evidence as proof of wrongdoing.
- Do not accuse a business or person of wrongdoing.
- Base your findings only on evidence returned by the tools.
- Do not invent advertisements, competitors, news, URLs, or facts.


Create a readable WEB SEARCH report.

Use clear sections and put each item on its own line.

Format it exactly like this:

WEB SEARCH

Brand: <brand>
Location: <location>

Owner Website
Status: <Found / Not found / Not provided>
Domain: <domain>
Position: #<position when available>

Organic Results
1. <title>
   Domain: <domain>
   Type: <Owner / Potential Competitor / Directory / Social / News-media / Unknown>
   Reason: <short reason>

2. <title>
   Domain: <domain>
   Type: <classification>
   Reason: <short reason>

3. <title>
   Domain: <domain>
   Type: <classification>
   Reason: <short reason>

Only include important results.

Advertisements
If advertisements were returned:

1. <advertiser>
   Domain: <domain>
   Type: <Potential Competitor / Other>
   Reason: <short reason>

If no advertisements were returned, write exactly:

No ads found

Potential Competitors
If potential competitors were found:

1. <name>
   Domain: <domain>
   Reason: <short reason>

If none were found, write:

None identified

Web Summary
Write one detailed paragraph explaining what the Google Search
evidence shows.

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
- Important business listings
- Business name
- Location/address when available
- Type/category when available
- Whether the listing appears relevant to the brand
- Potential competitor information when relevant

Maps Summary
- Give a detailed but concise summary of the Maps evidence.


------------------------------------------------------------
GOOGLE NEWS
------------------------------------------------------------

After using news_search, provide:

News Findings
- Important relevant articles
- Article title
- Source
- Date when available
- Brand or competitor mentioned
- Short reason why the article is relevant

News Summary
- Give a detailed but concise summary of the News evidence.


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
FINAL OUTPUT
------------------------------------------------------------

Return:

- search queries used
- investigation location
- owner website status
- WEB SEARCH report
- MAPS findings
- NEWS findings
- anomaly_detected: true/false
- explanation
- source links
""",
    tools=[search_tool, maps_tool, news_tool],
    output_schema=BrandInvestigationResult,
)


# ============================================================
# ORCHESTRATION — SINGLE CALL, NO BRANCHING
# ============================================================

async def investigate_brand(runner, session_service, brand, state, website):

    session_id = f"check_{state.replace(' ', '_')}"

    await session_service.create_session(
        app_name="brandguard360",
        user_id="test_user",
        session_id=session_id
    )

    message = types.Content(
        role="user",
        parts=[
            types.Part(
                text=(
                    f"Investigate the brand '{brand}' in '{state}'. "
                    f"Owner website: '{website}'."
                )
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

    print(f"\n{'=' * 50}")
    print(f"{state}")
    print(f"{'=' * 50}")

    try:
        result = json.loads(output)

        print("\nWEB SEARCH")
        print("-" * 50)
        print(result.get("web_search_report", "No web search report."))

        print("\nMAPS")
        print("-" * 50)
        print(result.get("maps_findings", "No Maps findings."))

        print("\nNEWS")
        print("-" * 50)
        print(result.get("news_findings", "No News findings."))

        print("\nFINAL ANALYSIS")
        print("-" * 50)
        print(f"Anomaly Detected: {result.get('anomaly_detected')}")
        print(f"\nExplanation:\n{result.get('explanation', '')}")

        print("\nSources")
        print("-" * 50)
        for source in result.get("source_links", []):
            print(source)

    except json.JSONDecodeError:
        print(output)


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

    brand = "Netflix"
    state = "Mumbai"
    website = "https://www.netflix.com/in/"

    await investigate_brand(
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