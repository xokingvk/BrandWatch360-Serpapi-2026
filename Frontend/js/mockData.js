/**
 * BrandGuard360 — Mock Investigation Data Layer
 * Evidence-based investigation dossiers matching the locked workflow:
 * Google Search -> Google Maps -> Google News -> Evidence Report
 * 
 * Rules:
 * - No numeric scores anywhere
 * - No bullet character anywhere
 * - Neutral evidence-based language
 * - Signals: CONFIRMED, CONFLICTING, UNKNOWN
 */

const MOCK_INVESTIGATIONS = {
  "makeprd": {
    id: "inv-makeprd-01",
    brand: "Makeprd",
    location: "Chennai, Tamil Nadu",
    website: "https://makeprd.com",
    date: "Oct 04, 2026",
    overall_signal: "CONFIRMED",
    explanation: "Available results show a consistent online presence for the investigated brand. No meaningful anomaly was confirmed across the reviewed sources.",
    executive_summary: "Investigation across Google Search, Google Maps, and Google News shows an established search presence for Makeprd based in Chennai, Tamil Nadu. The owner website appears in top organic placements, verified local business listings correspond with official location records, and press coverage reflects standard company milestones without conflicting brand signals.",
    sources_summary: {
      search: {
        signal: "Positive",
        summary: "Owner domain identified in organic results at position #2. No concerning sponsored advertisements observed."
      },
      maps: {
        signal: "Positive",
        summary: "Relevant local listings found in Chennai IT corridors matching verified business categories."
      },
      news: {
        signal: "Positive",
        summary: "Recent editorial coverage covers engineering expansion and regional industry participation."
      }
    },
    key_findings: [
      {
        source: "Search",
        title: "Owner Website",
        status: "Positive",
        explanation: "Found in organic results at position #2 with verified company metadata.",
        url: "https://makeprd.com"
      },
      {
        source: "Search",
        title: "Advertisements",
        status: "Positive",
        explanation: "No concerning sponsored results observed bidding against the brand query.",
        url: "https://google.com/search?q=Makeprd"
      },
      {
        source: "Maps",
        title: "Maps Presence",
        status: "Positive",
        explanation: "Relevant local listings found across Anna Salai and OMR business centers.",
        url: "https://maps.google.com/?q=Makeprd+Chennai"
      },
      {
        source: "News",
        title: "News Context",
        status: "Positive",
        explanation: "Relevant coverage found in regional business press covering tech expansion.",
        url: "https://news.google.com/search?q=Makeprd"
      }
    ],
    web_search_report: {
      signal: "Positive",
      owner_website_status: "Found",
      owner_domain: "makeprd.com",
      owner_position: 2,
      explanation: "The owner domain appears at position #2 in organic search. Associated legitimate profiles on LinkedIn and Clutch corroborate the presence.",
      organic_results: [
        {
          position: 1,
          title: "Makeprd — Product Engineering & Digital Innovation",
          domain: "makeprd.com",
          type: "Owner",
          snippet: "Official portal for Makeprd. Designing and engineering enterprise digital solutions and scalable products for global organizations.",
          signal: "Positive",
          url: "https://makeprd.com"
        },
        {
          position: 2,
          title: "Makeprd: Company Overview and Services",
          domain: "makeprd.com/about",
          type: "Owner",
          snippet: "Learn about Makeprd core engineering teams, office locations in Chennai, and technology consulting offerings.",
          signal: "Positive",
          url: "https://makeprd.com/about"
        },
        {
          position: 3,
          title: "Makeprd — LinkedIn Corporate Profile",
          domain: "linkedin.com",
          type: "Social",
          snippet: "Makeprd, Information Technology & Services. Chennai, Tamil Nadu. View employee directory and recent team updates.",
          signal: "Positive",
          url: "https://linkedin.com/company/makeprd"
        },
        {
          position: 4,
          title: "Makeprd Company Profile on Clutch",
          domain: "clutch.co",
          type: "Directory",
          snippet: "Verified agency profile and client feedback for Makeprd, custom software development and cloud consulting.",
          signal: "Positive",
          url: "https://clutch.co/profile/makeprd"
        },
        {
          position: 5,
          title: "Makeprd GitHub Engineering Repositories",
          domain: "github.com",
          type: "Social",
          snippet: "Public repositories and developer documentation published by the Makeprd engineering department.",
          signal: "Positive",
          url: "https://github.com/makeprd"
        }
      ],
      advertisements: [],
      mentioned_brands: ["Makeprd", "Clutch.co", "LinkedIn Corporation"],
      potential_competitors: [
        {
          name: "CogniStream Technologies",
          domain: "cognistream.io",
          type: "Potential Competitor",
          note: "Regional software consulting firm appearing in adjacent directory listings."
        }
      ]
    },
    maps_findings: {
      signal: "Positive",
      summary: "Relevant nearby listings were found. One listing has similar naming and should be reviewed in context.",
      listings: [
        {
          id: "map-1",
          name: "Makeprd Headquarters",
          category: "Software Company",
          location: "Anna Salai, Teynampet, Chennai, Tamil Nadu 600018",
          rating: "4.8",
          review_count: 42,
          naming_signal: "Normal",
          coordinates: { lat: 13.0418, lng: 80.2483, x: 52, y: 44 },
          url: "https://maps.google.com/?q=Makeprd+Chennai"
        },
        {
          id: "map-2",
          name: "Makeprd Innovation Hub",
          category: "Corporate Office",
          location: "OMR IT Corridor, Sholinganallur, Chennai, Tamil Nadu 600119",
          rating: "4.7",
          review_count: 19,
          naming_signal: "Normal",
          coordinates: { lat: 12.9010, lng: 80.2279, x: 42, y: 76 },
          url: "https://maps.google.com/?q=Makeprd+OMR+Chennai"
        },
        {
          id: "map-3",
          name: "Prd Maker Tech Labs",
          category: "Coworking Space",
          location: "Guindy Industrial Estate, Chennai, Tamil Nadu 600032",
          rating: "4.2",
          review_count: 11,
          naming_signal: "Similar Naming",
          coordinates: { lat: 13.0067, lng: 80.2023, x: 28, y: 55 },
          url: "https://maps.google.com/?q=Prd+Maker+Chennai"
        }
      ]
    },
    news_findings: {
      signal: "Positive",
      summary: "Recent editorial coverage focuses on corporate expansion and technology leadership. No concerning editorial signals identified.",
      articles: [
        {
          headline: "Makeprd Expands Engineering Operations in Chennai Tech Corridor",
          publisher: "The Hindu Business Line",
          date: "Sep 18, 2026",
          summary: "Technology firm Makeprd announced the addition of a secondary engineering center in Chennai to support regional enterprise clients.",
          relevance: "Brand Coverage",
          url: "https://thehindubusinessline.com"
        },
        {
          headline: "Tamil Nadu SaaS and Engineering Ecosystem Reports Steady H2 Expansion",
          publisher: "Mint",
          date: "Aug 29, 2026",
          summary: "Regional industry survey highlighting growth among emerging product engineering firms including Makeprd and peer consultancies.",
          relevance: "Industry Context",
          url: "https://livemint.com"
        },
        {
          headline: "Enterprise Digital Acceleration Trends for 2026",
          publisher: "TechObserver India",
          date: "Jul 14, 2026",
          summary: "Analysis of modern product design practices with quotes from regional engineering leaders in Chennai.",
          relevance: "Potentially Relevant",
          url: "https://techobserver.in"
        }
      ]
    },
    anomaly_detected: false,
    source_links: [
      { label: "Google Search Result", url: "https://google.com/search?q=Makeprd" },
      { label: "Google Maps Listing", url: "https://maps.google.com/?q=Makeprd+Chennai" },
      { label: "Google News Coverage", url: "https://news.google.com/search?q=Makeprd" }
    ]
  },

  "apex logistics": {
    id: "inv-apex-02",
    brand: "Apex Logistics",
    location: "Mumbai, Maharashtra",
    website: "https://apexlogistics.in",
    date: "Sep 28, 2026",
    overall_signal: "CONFLICTING",
    explanation: "Conflicting local listings and sponsored advertisement bidding with similar naming were detected in the target market. Review of these listings is recommended to clarify distinct entities.",
    executive_summary: "Investigation of Apex Logistics in Mumbai reveals multiple active entities operating under similar commercial designations. While organic results reflect the owner domain, a sponsored advertisement from an adjacent freight operator and a distinct local business listing with identical naming in Andheri East indicate potential naming overlap that warrants contextual review.",
    sources_summary: {
      search: {
        signal: "Mixed",
        summary: "Owner domain found at position #1, but a sponsored advertisement from an adjacent logistics operator was captured."
      },
      maps: {
        signal: "Concerning",
        summary: "Two separate entities with near-identical names registered in adjacent commercial zones."
      },
      news: {
        signal: "Positive",
        summary: "Normal editorial coverage regarding container terminal logistics in Maharashtra."
      }
    },
    key_findings: [
      {
        source: "Search",
        title: "Owner Website",
        status: "Positive",
        explanation: "Found in organic results at position #1.",
        url: "https://apexlogistics.in"
      },
      {
        source: "Search",
        title: "Advertisements",
        status: "Mixed",
        explanation: "Sponsored advertisement observed from Apex Freight Global targeting the Mumbai market.",
        url: "https://google.com/search?q=Apex+Logistics+Mumbai"
      },
      {
        source: "Maps",
        title: "Maps Presence",
        status: "Concerning",
        explanation: "Separate business listing found in Andheri East using identical branding.",
        url: "https://maps.google.com/?q=Apex+Logistics+Mumbai"
      },
      {
        source: "News",
        title: "News Context",
        status: "Positive",
        explanation: "Industry context coverage retrieved regarding supply chain shipping lanes.",
        url: "https://news.google.com/search?q=Apex+Logistics"
      }
    ],
    web_search_report: {
      signal: "Mixed",
      owner_website_status: "Found",
      owner_domain: "apexlogistics.in",
      owner_position: 1,
      explanation: "Owner website is indexed in primary organic search. A sponsored ad from an unaffiliated freight entity appeared on the same query.",
      organic_results: [
        {
          position: 1,
          title: "Apex Logistics India — Integrated Freight and Warehousing",
          domain: "apexlogistics.in",
          type: "Owner",
          snippet: "Official site for Apex Logistics India. Multimodal freight transport, bonded warehousing, and customs clearance services across Mumbai.",
          signal: "Positive",
          url: "https://apexlogistics.in"
        },
        {
          position: 2,
          title: "Apex Logistics Corporate Track and Trace",
          domain: "apexlogistics.in/track",
          type: "Owner",
          snippet: "Consignment tracking portal for domestic cargo and sea freight shipments handled by Apex Logistics.",
          signal: "Positive",
          url: "https://apexlogistics.in/track"
        },
        {
          position: 3,
          title: "Apex Freight Global India Services",
          domain: "apex-freightglobal.com",
          type: "Potential Competitor",
          snippet: "International shipping and container freight solutions operating from Nhava Sheva and Mumbai suburbs.",
          signal: "Review Needed",
          url: "https://apex-freightglobal.com"
        },
        {
          position: 4,
          title: "Apex Logistics India Private Limited Company Profile",
          domain: "zaubacorp.com",
          type: "Directory",
          snippet: "Corporate registry filing, director details, and registered office records in Mumbai, Maharashtra.",
          signal: "Normal",
          url: "https://zaubacorp.com"
        }
      ],
      advertisements: [
        {
          advertiser: "Apex Freight Global India",
          domain: "apex-freightglobal.com",
          text: "International cargo and container forwarding from Mumbai ports. Commercial logistics partner.",
          signal: "Review Needed",
          url: "https://apex-freightglobal.com"
        }
      ],
      mentioned_brands: ["Apex Logistics", "Apex Freight Global", "Zauba Corp"],
      potential_competitors: [
        {
          name: "Apex Freight Global India",
          domain: "apex-freightglobal.com",
          type: "Potential Competitor",
          note: "Active sponsored ad bidding on similar brand terms in Mumbai region."
        }
      ]
    },
    maps_findings: {
      signal: "Concerning",
      summary: "Nearby listings were found with identical naming and should be reviewed in context to avoid misdirection.",
      listings: [
        {
          id: "map-apex-1",
          name: "Apex Logistics India Pvt Ltd",
          category: "Freight Forwarding Service",
          location: "Bandra Kurla Complex, Mumbai, Maharashtra 400051",
          rating: "4.4",
          review_count: 58,
          naming_signal: "Normal",
          coordinates: { lat: 19.0657, lng: 72.8687, x: 48, y: 35 },
          url: "https://maps.google.com/?q=Apex+Logistics+BKC"
        },
        {
          id: "map-apex-2",
          name: "Apex Logistics & Cargo Movers",
          category: "Logistics Service",
          location: "MIDC Industrial Area, Andheri East, Mumbai, Maharashtra 400093",
          rating: "3.7",
          review_count: 14,
          naming_signal: "Review Needed",
          coordinates: { lat: 19.1197, lng: 72.8711, x: 55, y: 22 },
          url: "https://maps.google.com/?q=Apex+Cargo+Andheri"
        }
      ]
    },
    news_findings: {
      signal: "Positive",
      summary: "Editorial coverage references trade sector developments and supply chain regulatory updates.",
      articles: [
        {
          headline: "Jawaharlal Nehru Port Trust Records Increase in Coastal Container Volume",
          publisher: "The Economic Times",
          date: "Aug 12, 2026",
          summary: "Logistics providers based in Mumbai report strong demand for multimodal transport corridors during monsoon season.",
          relevance: "Industry Context",
          url: "https://economictimes.indiatimes.com"
        }
      ]
    },
    anomaly_detected: true,
    source_links: [
      { label: "Google Search Result", url: "https://google.com/search?q=Apex+Logistics+Mumbai" },
      { label: "Google Maps Listing", url: "https://maps.google.com/?q=Apex+Logistics+BKC" }
    ]
  },

  "terra flora organics": {
    id: "inv-terra-03",
    brand: "Terra Flora Organics",
    location: "Bengaluru, Karnataka",
    website: "https://terraflora.co",
    date: "Sep 15, 2026",
    overall_signal: "UNKNOWN",
    explanation: "Limited public search presence was returned across reviewed sources. Absence of historical news coverage and sparse local listings prevent conclusive confirmation.",
    executive_summary: "Terra Flora Organics demonstrates an early-stage digital footprint in Bengaluru. Organic results present the registered domain, but no physical Google Maps profile was confirmed and no editorial news coverage was retrieved. Absence of evidence does not indicate wrongdoing, but results in an overall unknown signal pending additional public records.",
    sources_summary: {
      search: {
        signal: "Positive",
        summary: "Owner domain detected in organic search at position #1. No advertisements found."
      },
      maps: {
        signal: "Unknown",
        summary: "No relevant Google Maps listings were returned for this query in Bengaluru."
      },
      news: {
        signal: "Unknown",
        summary: "No relevant editorial news coverage was returned in recent archives."
      }
    },
    key_findings: [
      {
        source: "Search",
        title: "Owner Website",
        status: "Positive",
        explanation: "Found in organic results at position #1.",
        url: "https://terraflora.co"
      },
      {
        source: "Search",
        title: "Advertisements",
        status: "Normal",
        explanation: "No sponsored advertisements were returned for this investigation.",
        url: "https://google.com/search?q=Terra+Flora+Organics"
      },
      {
        source: "Maps",
        title: "Maps Presence",
        status: "Unknown",
        explanation: "No relevant Maps listings were returned.",
        url: "https://maps.google.com/?q=Terra+Flora+Organics"
      },
      {
        source: "News",
        title: "News Context",
        status: "Unknown",
        explanation: "No relevant news coverage was found.",
        url: "https://news.google.com/search?q=Terra+Flora+Organics"
      }
    ],
    web_search_report: {
      signal: "Positive",
      owner_website_status: "Found",
      owner_domain: "terraflora.co",
      owner_position: 1,
      explanation: "Single organic result cataloged for the primary brand domain. Brand query volume is currently low.",
      organic_results: [
        {
          position: 1,
          title: "Terra Flora Organics — Pure Botanical Wellness",
          domain: "terraflora.co",
          type: "Owner",
          snippet: "Artisanal organic skincare and botanical extracts based in Bengaluru. Sustainable formulations sourced from local organic cultivators.",
          signal: "Positive",
          url: "https://terraflora.co"
        },
        {
          position: 2,
          title: "Terra Flora Organics on Instagram",
          domain: "instagram.com",
          type: "Social",
          snippet: "Photographs, formulation updates, and community stories from Terra Flora Organics in Bengaluru.",
          signal: "Positive",
          url: "https://instagram.com/terrafloraorganics"
        }
      ],
      advertisements: [],
      mentioned_brands: ["Terra Flora Organics"],
      potential_competitors: []
    },
    maps_findings: {
      signal: "Unknown",
      summary: "No verified Google Maps listing was returned for the brand in the specified metropolitan area.",
      listings: []
    },
    news_findings: {
      signal: "Unknown",
      summary: "No relevant editorial news coverage was found for this brand in the past 12 months.",
      articles: []
    },
    anomaly_detected: false,
    source_links: [
      { label: "Google Search Result", url: "https://google.com/search?q=Terra+Flora+Organics" }
    ]
  }
};

/**
 * Report History Collection
 */
const PREVIOUS_REPORTS = [
  {
    id: "inv-makeprd-01",
    brand: "Makeprd",
    location: "Chennai, Tamil Nadu",
    website: "https://makeprd.com",
    signal: "CONFIRMED",
    date: "Oct 04, 2026",
    summary: "Consistent search footprint with verified office listings."
  },
  {
    id: "inv-apex-02",
    brand: "Apex Logistics",
    location: "Mumbai, Maharashtra",
    website: "https://apexlogistics.in",
    signal: "CONFLICTING",
    date: "Sep 28, 2026",
    summary: "Overlapping local listing and sponsored ad observed."
  },
  {
    id: "inv-terra-03",
    brand: "Terra Flora Organics",
    location: "Bengaluru, Karnataka",
    website: "https://terraflora.co",
    signal: "UNKNOWN",
    date: "Sep 15, 2026",
    summary: "Early-stage footprint with no Maps listing or press."
  }
];

/**
 * Data Access Layer (Future-proof abstraction for FastAPI backend)
 */
const BrandGuardData = {
  /**
   * Fetch an investigation dossier by brand and location
   * @param {string} brand 
   * @param {string} location 
   * @param {string} [website] 
   * @returns {Promise<Object>}
   */
  async getInvestigation(brand, location, website) {
    // Normalization key
    const normalizedKey = (brand || '').toLowerCase().trim();
    
    // Simulate lightweight network dispatch
    await new Promise(r => setTimeout(r, 60));

    if (MOCK_INVESTIGATIONS[normalizedKey]) {
      const inv = JSON.parse(JSON.stringify(MOCK_INVESTIGATIONS[normalizedKey]));
      if (location) inv.location = location;
      if (website) inv.website = website;
      return inv;
    }

    // Dynamic fallback generation for arbitrary brand input
    const cleanBrand = brand || "Investigated Brand";
    const cleanLocation = location || "National Market";
    const cleanDomain = website ? website.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : `${cleanBrand.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

    return {
      id: `inv-${Date.now()}`,
      brand: cleanBrand,
      location: cleanLocation,
      website: website || `https://${cleanDomain}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      overall_signal: "CONFIRMED",
      explanation: `Available results show a consistent online presence for ${cleanBrand}. No meaningful anomaly was confirmed across the reviewed sources.`,
      executive_summary: `Investigation across Google Search, Google Maps, and Google News shows an active search presence for ${cleanBrand} in ${cleanLocation}. The owner website appears in organic placements and verified local signals correspond with public business records without conflicting brand signals.`,
      sources_summary: {
        search: {
          signal: "Positive",
          summary: `Owner domain ${cleanDomain} was identified in organic search. No concerning sponsored advertisements observed.`
        },
        maps: {
          signal: "Positive",
          summary: `Relevant business listing identified in ${cleanLocation} matching registered category.`
        },
        news: {
          signal: "Positive",
          summary: "Standard industry presence cataloged in public records."
        }
      },
      key_findings: [
        {
          source: "Search",
          title: "Owner Website",
          status: "Positive",
          explanation: `Found in organic results for ${cleanDomain} with relevant metadata.`,
          url: `https://${cleanDomain}`
        },
        {
          source: "Search",
          title: "Advertisements",
          status: "Positive",
          explanation: "No concerning sponsored results observed.",
          url: `https://google.com/search?q=${encodeURIComponent(cleanBrand)}`
        },
        {
          source: "Maps",
          title: "Maps Presence",
          status: "Positive",
          explanation: `Relevant local listings found in ${cleanLocation}.`,
          url: `https://maps.google.com/?q=${encodeURIComponent(cleanBrand + ' ' + cleanLocation)}`
        },
        {
          source: "News",
          title: "News Context",
          status: "Positive",
          explanation: "Relevant public context and directory records cataloged.",
          url: `https://news.google.com/search?q=${encodeURIComponent(cleanBrand)}`
        }
      ],
      web_search_report: {
        signal: "Positive",
        owner_website_status: website ? "Found" : "Not Provided",
        owner_domain: cleanDomain,
        owner_position: 1,
        explanation: `The domain ${cleanDomain} appears in organic search results. Associated directory listings corroborate the brand entity.`,
        organic_results: [
          {
            position: 1,
            title: `${cleanBrand} — Official Portal`,
            domain: cleanDomain,
            type: "Owner",
            snippet: `Primary online presence for ${cleanBrand}. Commercial operations, services, and official contact information for ${cleanLocation}.`,
            signal: "Positive",
            url: `https://${cleanDomain}`
          },
          {
            position: 2,
            title: `${cleanBrand} — Corporate Directory Profile`,
            domain: "linkedin.com",
            type: "Social",
            snippet: `${cleanBrand} business profile and updates representing operations in ${cleanLocation}.`,
            signal: "Positive",
            url: `https://linkedin.com/search/results/all/?keywords=${encodeURIComponent(cleanBrand)}`
          },
          {
            position: 3,
            title: `${cleanBrand} on Regional Trade Directory`,
            domain: "indiamart.com",
            type: "Directory",
            snippet: `Verified listing and business details cataloged for ${cleanBrand} in ${cleanLocation}.`,
            signal: "Positive",
            url: "https://indiamart.com"
          }
        ],
        advertisements: [],
        mentioned_brands: [cleanBrand],
        potential_competitors: []
      },
      maps_findings: {
        signal: "Positive",
        summary: `Relevant nearby listings were found for ${cleanBrand} in ${cleanLocation}.`,
        listings: [
          {
            id: `map-${Date.now()}-1`,
            name: `${cleanBrand} Main Office`,
            category: "Commercial Business",
            location: `${cleanLocation}`,
            rating: "4.6",
            review_count: 24,
            naming_signal: "Normal",
            coordinates: { lat: 13.0827, lng: 80.2707, x: 50, y: 50 },
            url: `https://maps.google.com/?q=${encodeURIComponent(cleanBrand + ' ' + cleanLocation)}`
          }
        ]
      },
      news_findings: {
        signal: "Positive",
        summary: "Contextual mentions and industry coverage cataloged in public archives.",
        articles: [
          {
            headline: `${cleanBrand} Announces Operational Milestones in ${cleanLocation}`,
            publisher: "Regional Business Wire",
            date: "Recent Coverage",
            summary: `Commercial update covering business activities and market development for ${cleanBrand}.`,
            relevance: "Brand Coverage",
            url: `https://news.google.com/search?q=${encodeURIComponent(cleanBrand)}`
          }
        ]
      },
      anomaly_detected: false,
      source_links: [
        { label: "Google Search", url: `https://google.com/search?q=${encodeURIComponent(cleanBrand)}` },
        { label: "Google Maps", url: `https://maps.google.com/?q=${encodeURIComponent(cleanBrand + ' ' + cleanLocation)}` },
        { label: "Google News", url: `https://news.google.com/search?q=${encodeURIComponent(cleanBrand)}` }
      ]
    };
  },

  /**
   * Get all reports
   */
  async getReports() {
    return [...PREVIOUS_REPORTS];
  },

  /**
   * Get investigation by ID
   */
  async getInvestigationById(id) {
    for (const key of Object.keys(MOCK_INVESTIGATIONS)) {
      if (MOCK_INVESTIGATIONS[key].id === id) {
        return JSON.parse(JSON.stringify(MOCK_INVESTIGATIONS[key]));
      }
    }
    return MOCK_INVESTIGATIONS["makeprd"];
  }
};

// Export to global scope
window.BrandGuardData = BrandGuardData;
