import asyncio
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

    print(f"\n{'=' * 50}\n{state}\n{'=' * 50}")
    print(output)

    return output


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