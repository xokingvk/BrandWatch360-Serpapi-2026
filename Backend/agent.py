import asyncio
from dotenv import load_dotenv

load_dotenv()

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel

from serpapi_search_tools import web_search, maps_search, news_search, SearchResultMode


# ============================================================
# TOOLS — all three, always available
# ============================================================
search_tool = web_search(
    allowed_engines=["google"],
    default_engine="google",
    result_limit=10,
    mode=SearchResultMode.FULL,
)

maps_tool = maps_search(
    result_limit=10,
)

news_tool = news_search(
    result_limit=10,
)


# ============================================================
# SCHEMA — single combined report
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


# ============================================================
# SINGLE AGENT — always runs all 3 tools
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
1. web_search — to check organic results and sponsored ads for the brand query.
2. maps_search — to check nearby business listings for copycat/lookalike naming.
3. news_search — to check for relevant news coverage about the brand or
   any competitor found in step 1 or 2 (disputes, complaints, legal issues).

Analyze all three results together.

Focus on:
1. Whether the owner's website appears in organic/ad results.
2. Whether a different domain appears in a sponsored ad.
3. Whether nearby Maps listings show copycat naming.
4. Whether news coverage supports or contradicts any suspicious finding.
5. Whether the combined evidence represents a meaningful search-presence anomaly.

Important:
- Do not assume the owner's website must rank #1.
- A directory, social profile, marketplace, or legitimate result above the owner's site is not automatically an anomaly.
- A lack of a Maps listing is not automatically suspicious.
- Do not treat absence of evidence as proof of wrongdoing.
- Do not accuse a business or person of wrongdoing.
- Base your findings only on evidence returned by the tools.

Return a concise investigation result containing:
- search queries used
- investigation location
- owner website status
- organic findings
- advertisement findings
- maps findings
- news findings
- anomaly_detected: true/false
- explanation
- source links
""",
    tools=[search_tool, maps_tool, news_tool],
    output_schema=BrandInvestigationResult,
)


# ============================================================
# ORCHESTRATION — single call, no branching
# ============================================================
async def investigate_brand(runner, session_service, brand, state, website):
    session_id = f"check_{state.replace(' ', '_')}"
    await session_service.create_session(
        app_name="brandguard360", user_id="test_user", session_id=session_id
    )

    message = types.Content(
        role="user",
        parts=[types.Part(text=(
            f"Investigate the brand '{brand}' in '{state}'. "
            f"Owner website: '{website}'."
        ))],
    )

    output = ""
    async for event in runner.run_async(
        user_id="test_user", session_id=session_id, new_message=message
    ):
        if event.is_final_response() and event.content:
            for part in event.content.parts or []:
                if part.text:
                    output += part.text

    print(f"\n{'=' * 50}\n{state}\n{'=' * 50}")
    print(output)
    return output


async def run_test():
    session_service = InMemorySessionService()

    runner = Runner(agent=root_agent, app_name="brandguard360", session_service=session_service)

    brand = "Netflix"
    state = "Mumbai"
    website = "https://www.netflix.com/in/"

    await investigate_brand(runner, session_service, brand, state, website)


if __name__ == "__main__":
    asyncio.run(run_test())