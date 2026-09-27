import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools import FunctionTool
from google.genai import types
from pydantic import BaseModel

import serpapi
from serpapi_search_tools import web_search, SearchResultMode



search_tool = web_search(
    allowed_engines=["google"],
    default_engine="google",
    result_limit=10,
    mode=SearchResultMode.FULL,
)



async def google_ads_search(query: str, location: str) -> dict:
    """
    Searches Google Ads API via SerpApi to find sponsored/paid ads
    for the given query and location. Returns the raw ads data.
    """
    def _sync_search():
        client = serpapi.Client(api_key=os.getenv("SERPAPI_API_KEY"))
        result = client.search({
            "engine": "google_ads",
            "q": query,
            "location": location,
        })
        ads = result.get("ads_results", result.get("ads", []))
        return {"ads_found": len(ads), "ads": ads}

    try:
        return await asyncio.wait_for(asyncio.to_thread(_sync_search), timeout=15)
    except asyncio.TimeoutError:
        return {"ads_found": 0, "ads": [], "error": "Request timed out (15s)"}
    except Exception as e:
        return {"ads_found": 0, "ads": [], "error": f"Location or query error: {str(e)}"}


ads_tool = FunctionTool(func=google_ads_search)



class SearchInvestigationResult(BaseModel):
    search_queries: list[str]
    investigation_location: str
    owner_website_status: str
    organic_findings: str
    advertisement_findings: str
    anomaly_detected: bool
    explanation: str
    source_links: list[str]


root_agent = Agent(
    name="brandguard360_search_agent",
    model="gemini-flash-lite-latest",
    instruction="""
You are the BrandGuard360 search investigation agent.

Given:
- a brand name
- a city
- an optional owner website URL
- a specific local investigation area

Step 1: Use the web_search tool with Google to investigate the exact
brand query and gather organic results.

Step 2: Use the google_ads_search tool with the SAME query and location
to specifically check for sponsored/paid advertisements bidding on the
brand name. This is a dedicated ads-only check — always call it after
web_search, regardless of what web_search returned.

Step 3: Analyze BOTH results together.

Focus on:
1. Organic search results from web_search.
2. Sponsored advertisements from google_ads_search.
3. Whether the owner's website appears in either result set.
4. Whether a different domain appears in the ads results.
5. Whether the different result is relevant to the searched brand.
6. Whether the combined evidence represents a meaningful search-presence anomaly.

Important:
- Do not assume that the owner's website must rank #1.
- A directory, social profile, marketplace, or other legitimate result above the owner's site is not automatically an anomaly.
- Do not treat absence of evidence as proof of wrongdoing.
- Do not accuse a business or person of wrongdoing.
- Base your findings only on evidence returned by the tools.

Return a concise investigation result containing:
- search query
- investigation location
- owner website status
- organic findings
- advertisement findings (from google_ads_search specifically)
- anomaly_detected: true/false
- explanation
- source links
""",
    tools=[search_tool, ads_tool],
    output_schema=SearchInvestigationResult,
)


async def investigate_area(runner, session_service, brand: str, city: str, website: str, area: str):
    session_id = f"check_{area.replace(' ', '_')}"

    await session_service.create_session(
        app_name="brandguard360",
        user_id="test_user",
        session_id=session_id,
    )

    message = types.Content(
        role="user",
        parts=[
            types.Part(
                text=(
                    f"Investigate the brand '{brand}' "
                    f"in '{city}'. "
                    f"Owner website: '{website}'. "
                    f"Investigation area: '{area}'."
                )
            )
        ],
    )

    output = ""
    async for event in runner.run_async(
        user_id="test_user",
        session_id=session_id,
        new_message=message,
    ):
        if event.is_final_response() and event.content:
            for part in event.content.parts or []:
                if part.text:
                    output += part.text

    return output


async def run_test():
    session_service = InMemorySessionService()

    runner = Runner(
        agent=root_agent,
        app_name="brandguard360",
        session_service=session_service,
    )

    brand = "zomato"
    city = "kanchipuram"
    website = "https://www.zomato.com/"
    areas = ["kanchipuram"]

    for area in areas:
        result = await investigate_area(runner, session_service, brand, city, website, area)
        print(f"\n{'=' * 50}\nAREA: {area}\n{'=' * 50}")
        print(result)
        await asyncio.sleep(2)


if __name__ == "__main__":
    asyncio.run(run_test())