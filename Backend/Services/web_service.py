from serpapi_search_tools import web_search, SearchResultMode


# ============================================================
# WEB SEARCH SERVICE
# ============================================================

search_tool = web_search(
    allowed_engines=["google"],
    default_engine="google",
    result_limit=10,
    mode=SearchResultMode.FULL,
)