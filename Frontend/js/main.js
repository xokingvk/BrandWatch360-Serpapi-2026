/**
 * BrandGuard360 — Application Controller
 * Connects frontend directly to the FastAPI backend at localhost:8000.
 * 
 * Flow:
 * Browser -> POST http://localhost:8000/api/investigate -> FastAPI -> Google ADK -> SerpApi & Gemini -> Structured JSON
 * 
 * Rules:
 * - REAL DATA ONLY. ZERO MOCK VALUES in the live investigation flow.
 * - Single API Base URL configuration.
 * - Truthful loading progress (no fabricated stage completions).
 * - No frontend fabrication of ratings, reviews, ad counts, or competitors.
 * - Neutral evidence-based language (CONFIRMED, CONFLICTING, UNKNOWN).
 * - Complete state clearing on every new investigation.
 */

// =========================================================================
// CENTRAL API CONFIGURATION
// =========================================================================
const API_BASE_URL = window.BRANDGUARD_API_URL || "http://localhost:8000";

document.addEventListener('DOMContentLoaded', () => {

  // Current Active State (Stateless / Current Session Memory)
  let currentInvestigation = null;
  let allReportsList = [];
  let currentFilter = 'all';
  let currentSearchQuery = '';

  // DOM Elements - Shells & Views
  const homePageWrapper = document.getElementById('homePageWrapper');
  const viewLoading = document.getElementById('viewLoading');
  const internalAppShell = document.getElementById('internalAppShell');
  const shellSidebar = document.getElementById('shellSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const btnToggleMobileSidebar = document.getElementById('btnToggleMobileSidebar');

  // Internal Views
  const views = {
    overview: document.getElementById('viewOverview'),
    search: document.getElementById('viewSearch'),
    maps: document.getElementById('viewMaps'),
    news: document.getElementById('viewNews'),
    reports: document.getElementById('viewReports'),
    error: document.getElementById('viewError')
  };

  // Nav Items & Segmented Tabs
  const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item[data-view]');
  const segmentTabs = document.querySelectorAll('.segment-tab[data-view]');
  const reportSegmentedBar = document.getElementById('reportSegmentedBar');

  // Home Form Elements
  const form = document.getElementById('investigationForm');
  const inputBrand = document.getElementById('inputBrandName');
  const inputLocation = document.getElementById('inputLocation');
  const inputWebsite = document.getElementById('inputWebsite');
  const btnSubmit = document.getElementById('btnInvestigateSubmit');
  const brandError = document.getElementById('brandError');
  const locationError = document.getElementById('locationError');
  const websiteError = document.getElementById('websiteError');
  const btnNavInvestigate = document.getElementById('btnNavInvestigate');
  const navHome = document.getElementById('navHome');
  const navHowItWorks = document.getElementById('navHowItWorks');
  const brandLogo = document.getElementById('brandLogo');

  // Loading Screen Elements
  const loadingBrandTarget = document.getElementById('loadingBrandTarget');
  const loadingLocationTarget = document.getElementById('loadingLocationTarget');
  const stageStepSearch = document.getElementById('stageStepSearch');
  const stageStepMaps = document.getElementById('stageStepMaps');
  const stageStepNews = document.getElementById('stageStepNews');
  const stagePillSearch = document.getElementById('stagePillSearch');
  const stagePillMaps = document.getElementById('stagePillMaps');
  const stagePillNews = document.getElementById('stagePillNews');
  const stageBarSearch = document.getElementById('stageBarSearch');
  const stageBarMaps = document.getElementById('stageBarMaps');
  const stageBarNews = document.getElementById('stageBarNews');
  const stageMsgSearch = document.getElementById('stageMsgSearch');
  const stageMsgMaps = document.getElementById('stageMsgMaps');
  const stageMsgNews = document.getElementById('stageMsgNews');
  const readyBanner = document.getElementById('readyBanner');
  const btnViewFindings = document.getElementById('btnViewFindings');

  // Header Elements
  const headerBrandBadge = document.getElementById('headerBrandBadge');
  const headerLocationTag = document.getElementById('headerLocationTag');
  const headerWebsiteLink = document.getElementById('headerWebsiteLink');
  const headerWebsiteText = document.getElementById('headerWebsiteText');
  const btnHeaderNewInvestigation = document.getElementById('btnHeaderNewInvestigation');
  const btnSidebarNewInvestigation = document.getElementById('btnSidebarNewInvestigation');
  const sidebarBrandLogo = document.getElementById('sidebarBrandLogo');

  // Settings Modal Elements
  const settingsModal = document.getElementById('settingsModal');
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  const btnDismissSettings = document.getElementById('btnDismissSettings');

  // Overview Elements
  const ovBrandName = document.getElementById('ovBrandName');
  const ovLocation = document.getElementById('ovLocation');
  const ovWebsite = document.getElementById('ovWebsite');
  const ovWebsiteLink = document.getElementById('ovWebsiteLink');
  const ovWebsiteSep = document.getElementById('ovWebsiteSep');
  const ovWebsiteItem = document.getElementById('ovWebsiteItem');
  const ovOverallSignalBadge = document.getElementById('ovOverallSignalBadge');
  const ovOverallSignalExplanation = document.getElementById('ovOverallSignalExplanation');
  const ovSearchSignal = document.getElementById('ovSearchSignal');
  const ovSearchExplanation = document.getElementById('ovSearchExplanation');
  const ovMapsSignal = document.getElementById('ovMapsSignal');
  const ovMapsExplanation = document.getElementById('ovMapsExplanation');
  const ovNewsSignal = document.getElementById('ovNewsSignal');
  const ovNewsExplanation = document.getElementById('ovNewsExplanation');
  const ovKeyFindingsGrid = document.getElementById('ovKeyFindingsGrid');
  const ovExecutiveSummaryText = document.getElementById('ovExecutiveSummaryText');
  const btnExportReport = document.getElementById('btnExportReport');
  const btnOverviewNewInvestigation = document.getElementById('btnOverviewNewInvestigation');
  const btnReportsNewInvestigation = document.getElementById('btnReportsNewInvestigation');

  // Search Screen Elements
  const searchSourceSignalBadge = document.getElementById('searchSourceSignalBadge');
  const searchOwnerDomain = document.getElementById('searchOwnerDomain');
  const searchOwnerPosition = document.getElementById('searchOwnerPosition');
  const searchOwnerStatusPill = document.getElementById('searchOwnerStatusPill');
  const searchOwnerExplanation = document.getElementById('searchOwnerExplanation');
  const searchQueriesSection = document.getElementById('searchQueriesSection');
  const searchQueriesContainer = document.getElementById('searchQueriesContainer');
  const searchOrganicContainer = document.getElementById('searchOrganicContainer');
  const searchAdsContainer = document.getElementById('searchAdsContainer');
  const searchMentionedBrandsCluster = document.getElementById('searchMentionedBrandsCluster');
  const searchPotentialCompetitorsList = document.getElementById('searchPotentialCompetitorsList');

  // Maps Screen Elements
  const mapsSourceSignalBadge = document.getElementById('mapsSourceSignalBadge');
  const mapsFindingsSummary = document.getElementById('mapsFindingsSummary');
  const mapsListingCount = document.getElementById('mapsListingCount');
  const mapsCoordTag = document.getElementById('mapsCoordTag');
  const mapsListingsContainer = document.getElementById('mapsListingsContainer');
  const mapPinsLayer = document.getElementById('mapPinsLayer');
  const mapTargetMarketText = document.getElementById('mapTargetMarketText');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  let currentMapScale = 1;

  // News Screen Elements
  const newsSourceSignalBadge = document.getElementById('newsSourceSignalBadge');
  const newsFindingsSummary = document.getElementById('newsFindingsSummary');
  const newsArticlesContainer = document.getElementById('newsArticlesContainer');

  // Reports Screen Elements
  const inputReportSearch = document.getElementById('inputReportSearch');
  const reportSignalFilters = document.getElementById('reportSignalFilters');
  const reportsTableBody = document.getElementById('reportsTableBody');

  // Error State Elements
  const btnTryAgain = document.getElementById('btnTryAgain');

  // Navigation badge counts
  const sideBadgeSearch = document.getElementById('sideBadgeSearch');
  const sideBadgeMaps = document.getElementById('sideBadgeMaps');
  const sideBadgeNews = document.getElementById('sideBadgeNews');
  const segCountSearch = document.getElementById('segCountSearch');
  const segCountMaps = document.getElementById('segCountMaps');
  const segCountNews = document.getElementById('segCountNews');

  // =========================================================================
  // STATE MANAGEMENT: COMPLETE PURGE OF PRIOR INVESTIGATION STATE
  // =========================================================================
  function clearInvestigationState() {
    currentInvestigation = null;

    // Header metadata
    if (headerBrandBadge) headerBrandBadge.textContent = '';
    if (headerLocationTag) headerLocationTag.textContent = '';
    if (headerWebsiteLink) {
      headerWebsiteLink.style.display = 'none';
      headerWebsiteLink.removeAttribute('href');
    }
    if (headerWebsiteText) headerWebsiteText.textContent = '';

    // Loading Screen
    if (loadingBrandTarget) loadingBrandTarget.textContent = '';
    if (loadingLocationTarget) loadingLocationTarget.textContent = '';

    if (stageStepSearch) stageStepSearch.className = 'stage-step';
    if (stageStepMaps) stageStepMaps.className = 'stage-step';
    if (stageStepNews) stageStepNews.className = 'stage-step';

    if (stagePillSearch) stagePillSearch.textContent = 'Pending';
    if (stagePillMaps) stagePillMaps.textContent = 'Pending';
    if (stagePillNews) stagePillNews.textContent = 'Pending';

    if (stageBarSearch) stageBarSearch.style.width = '0%';
    if (stageBarMaps) stageBarMaps.style.width = '0%';
    if (stageBarNews) stageBarNews.style.width = '0%';

    if (stageMsgSearch) stageMsgSearch.textContent = 'Awaiting pipeline initialization...';
    if (stageMsgMaps) stageMsgMaps.textContent = 'Queued behind Google Search';
    if (stageMsgNews) stageMsgNews.textContent = 'Queued behind Google Maps';

    if (readyBanner) readyBanner.style.display = 'none';

    // Overview
    if (ovBrandName) ovBrandName.textContent = '';
    if (ovLocation) ovLocation.textContent = '';
    if (ovWebsite) ovWebsite.textContent = '';
    if (ovWebsiteLink) ovWebsiteLink.removeAttribute('href');
    if (ovWebsiteSep) ovWebsiteSep.style.display = 'none';
    if (ovWebsiteItem) ovWebsiteItem.style.display = 'none';

    if (ovOverallSignalBadge) {
      ovOverallSignalBadge.textContent = '';
      ovOverallSignalBadge.className = 'signal-status-pill';
    }
    if (ovOverallSignalExplanation) ovOverallSignalExplanation.textContent = '';

    if (ovSearchSignal) ovSearchSignal.textContent = '';
    if (ovSearchExplanation) ovSearchExplanation.textContent = '';
    if (ovMapsSignal) ovMapsSignal.textContent = '';
    if (ovMapsExplanation) ovMapsExplanation.textContent = '';
    if (ovNewsSignal) ovNewsSignal.textContent = '';
    if (ovNewsExplanation) ovNewsExplanation.textContent = '';

    if (ovKeyFindingsGrid) ovKeyFindingsGrid.innerHTML = '';
    if (ovExecutiveSummaryText) ovExecutiveSummaryText.textContent = '';

    // Search View
    if (searchSourceSignalBadge) searchSourceSignalBadge.textContent = '';
    if (searchOwnerStatusPill) searchOwnerStatusPill.textContent = '';
    if (searchOwnerDomain) searchOwnerDomain.textContent = '';
    if (searchOwnerPosition) {
      searchOwnerPosition.textContent = '';
      searchOwnerPosition.style.display = 'none';
    }
    if (searchOwnerExplanation) searchOwnerExplanation.textContent = '';

    if (searchQueriesSection) searchQueriesSection.style.display = 'none';
    if (searchQueriesContainer) searchQueriesContainer.innerHTML = '';
    if (searchOrganicContainer) searchOrganicContainer.innerHTML = '';
    if (searchAdsContainer) searchAdsContainer.innerHTML = '';
    if (searchMentionedBrandsCluster) searchMentionedBrandsCluster.innerHTML = '';
    if (searchPotentialCompetitorsList) searchPotentialCompetitorsList.innerHTML = '';

    // Maps View
    if (mapsSourceSignalBadge) mapsSourceSignalBadge.textContent = '';
    if (mapsFindingsSummary) mapsFindingsSummary.textContent = '';
    if (mapsListingCount) {
      mapsListingCount.textContent = '';
      mapsListingCount.style.display = 'none';
    }
    if (mapsCoordTag) mapsCoordTag.textContent = '';
    if (mapTargetMarketText) mapTargetMarketText.textContent = '';
    if (mapsListingsContainer) mapsListingsContainer.innerHTML = '';
    if (mapPinsLayer) mapPinsLayer.innerHTML = '';

    // News View
    if (newsSourceSignalBadge) newsSourceSignalBadge.textContent = '';
    if (newsFindingsSummary) newsFindingsSummary.textContent = '';
    if (newsArticlesContainer) newsArticlesContainer.innerHTML = '';

    // Badges / Counts
    [sideBadgeSearch, sideBadgeMaps, sideBadgeNews, segCountSearch, segCountMaps, segCountNews].forEach(el => {
      if (el) {
        el.textContent = '';
        el.style.display = 'none';
      }
    });
  }

  // Helper: set field error
  const setFieldError = (inputEl, errorEl, message) => {
    const wrapper = inputEl.closest('.input-wrapper');
    if (message) {
      if (wrapper) wrapper.classList.add('error');
      if (errorEl) errorEl.textContent = message;
    } else {
      if (wrapper) wrapper.classList.remove('error');
      if (errorEl) errorEl.textContent = '';
    }
  };

  // URL Validator (permissive)
  const isValidUrl = (string) => {
    if (!string) return true;
    try {
      const url = new URL(string.startsWith('http') ? string : `https://${string}`);
      return url.hostname.includes('.');
    } catch (_) {
      return false;
    }
  };

  // Clear errors on input
  [inputBrand, inputLocation, inputWebsite].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        const errorEl = input === inputBrand ? brandError : (input === inputLocation ? locationError : websiteError);
        setFieldError(input, errorEl, '');
      });
    }
  });

  // Switch to View in Internal App Shell
  function navigateToView(viewName) {
    if (!views[viewName]) return;

    // Show shell, hide others
    homePageWrapper.style.display = 'none';
    viewLoading.style.display = 'none';
    internalAppShell.style.display = 'flex';
    internalAppShell.setAttribute('aria-hidden', 'false');

    // Toggle view panels
    Object.keys(views).forEach(key => {
      if (views[key]) {
        views[key].classList.toggle('active', key === viewName);
        if (key === viewName) {
          views[key].style.display = 'block';
        } else {
          views[key].style.display = 'none';
        }
      }
    });

    // Update sidebar active item
    sidebarNavItems.forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });

    // Update segmented bar active tab
    segmentTabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === viewName);
    });

    // Show or hide report segmented bar (only for overview, search, maps, news)
    if (['overview', 'search', 'maps', 'news'].includes(viewName)) {
      if (reportSegmentedBar) reportSegmentedBar.style.display = 'block';
    } else {
      if (reportSegmentedBar) reportSegmentedBar.style.display = 'none';
    }

    // Scroll main content to top
    const shellContent = document.getElementById('shellMainContent');
    if (shellContent) shellContent.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile drawer if open
    closeMobileDrawer();
  }

  // Switch to Home Page
  function navigateToHome(resetForm = false) {
    internalAppShell.style.display = 'none';
    internalAppShell.setAttribute('aria-hidden', 'true');
    viewLoading.style.display = 'none';
    viewLoading.setAttribute('aria-hidden', 'true');
    homePageWrapper.style.display = 'flex';

    if (resetForm) {
      inputBrand.value = '';
      inputLocation.value = '';
      inputWebsite.value = '';
      setFieldError(inputBrand, brandError, '');
      setFieldError(inputLocation, locationError, '');
      setFieldError(inputWebsite, websiteError, '');
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `
        <span class="btn-icon" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <span class="btn-text">Investigate Brand</span>
      `;
      setTimeout(() => {
        const invCard = document.getElementById('investigate-card');
        if (invCard) invCard.scrollIntoView({ behavior: 'smooth' });
        inputBrand.focus();
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Mobile Drawer Toggle
  function openMobileDrawer() {
    if (shellSidebar) shellSidebar.classList.add('mobile-open');
    if (sidebarBackdrop) {
      sidebarBackdrop.classList.add('visible');
      sidebarBackdrop.setAttribute('aria-hidden', 'false');
    }
  }

  function closeMobileDrawer() {
    if (shellSidebar) shellSidebar.classList.remove('mobile-open');
    if (sidebarBackdrop) {
      sidebarBackdrop.classList.remove('visible');
      sidebarBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnToggleMobileSidebar) {
    btnToggleMobileSidebar.addEventListener('click', openMobileDrawer);
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeMobileDrawer);
  }

  // Bind Sidebar Nav Items
  sidebarNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewName = item.dataset.view;
      if (viewName === 'reports') {
        renderReportsTable();
      }
      navigateToView(viewName);
    });
  });

  // Bind Segment Tabs
  segmentTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const viewName = tab.dataset.view;
      navigateToView(viewName);
    });
  });

  // Bind Overview "Inspect" buttons
  document.querySelectorAll('.btn-card-inspect[data-target-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.targetView;
      navigateToView(target);
    });
  });

  // New Investigation CTA triggers
  [btnHeaderNewInvestigation, btnSidebarNewInvestigation, btnOverviewNewInvestigation, btnReportsNewInvestigation].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToHome(true);
      });
    }
  });

  // Logo triggers
  if (sidebarBrandLogo) {
    sidebarBrandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToHome(false);
    });
  }

  // Helper to switch top nav active link
  function setActiveTopNav(activeEl) {
    if (navHome) navHome.classList.remove('active');
    if (navHowItWorks) navHowItWorks.classList.remove('active');
    if (activeEl) activeEl.classList.add('active');
  }

  // Top nav links on Home page
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveTopNav(navHome);
      navigateToHome(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (btnNavInvestigate) {
    btnNavInvestigate.addEventListener('click', (e) => {
      e.preventDefault();
      const invCard = document.getElementById('investigate-card');
      if (invCard) invCard.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputBrand.focus(), 300);
    });
  }

  if (navHome) {
    navHome.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveTopNav(navHome);
      navigateToHome(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (navHowItWorks) {
    navHowItWorks.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveTopNav(navHowItWorks);
      if (homePageWrapper.style.display === 'none') {
        navigateToHome(false);
      }
      const howSection = document.getElementById('how-it-works');
      if (howSection) {
        howSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Settings Modal Handlers
  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      settingsModal.style.display = 'flex';
      settingsModal.setAttribute('aria-hidden', 'false');
    });
  }

  const dismissSettings = () => {
    settingsModal.style.display = 'none';
    settingsModal.setAttribute('aria-hidden', 'true');
  };

  if (btnCloseSettings) btnCloseSettings.addEventListener('click', dismissSettings);
  if (btnDismissSettings) btnDismissSettings.addEventListener('click', dismissSettings);
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) dismissSettings();
    });
  }

  // Error State "Try Again"
  if (btnTryAgain) {
    btnTryAgain.addEventListener('click', () => {
      navigateToHome(true);
    });
  }

  // Map Zoom Controls
  if (btnZoomIn && btnZoomOut) {
    btnZoomIn.addEventListener('click', () => {
      if (currentMapScale < 1.4) {
        currentMapScale += 0.15;
        applyMapZoom();
      }
    });
    btnZoomOut.addEventListener('click', () => {
      if (currentMapScale > 0.85) {
        currentMapScale -= 0.15;
        applyMapZoom();
      }
    });
  }

  function applyMapZoom() {
    const mesh = document.querySelector('.map-grid-mesh');
    const pins = document.getElementById('mapPinsLayer');
    if (mesh) mesh.style.transform = `scale(${currentMapScale})`;
    if (pins) pins.style.transform = `scale(${currentMapScale})`;
  }

  // =========================================================================
  // FORM SUBMISSION -> REAL FASTAPI INVESTIGATION
  // =========================================================================
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let hasError = false;
    const brandValue = inputBrand.value.trim();
    const locationValue = inputLocation.value.trim();
    const websiteValue = inputWebsite.value.trim();

    if (!brandValue) {
      setFieldError(inputBrand, brandError, 'Please enter a brand name to investigate.');
      hasError = true;
    } else {
      setFieldError(inputBrand, brandError, '');
    }

    if (!locationValue) {
      setFieldError(inputLocation, locationError, 'Please specify the city or regional market.');
      hasError = true;
    } else {
      setFieldError(inputLocation, locationError, '');
    }

    if (websiteValue && !isValidUrl(websiteValue)) {
      setFieldError(inputWebsite, websiteError, 'Please enter a valid website URL or domain.');
      hasError = true;
    } else {
      setFieldError(inputWebsite, websiteError, '');
    }

    if (hasError) {
      const firstInvalid = !brandValue ? inputBrand : (!locationValue ? inputLocation : inputWebsite);
      firstInvalid.focus();
      return;
    }

    // Disable duplicate submission
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `
      <span class="btn-text">Investigating...</span>
    `;

    // Launch Real Investigation Workflow
    await startLiveInvestigation(brandValue, locationValue, websiteValue);
  });

  // =========================================================================
  // REAL INVESTIGATION WORKFLOW (FASTAPI)
  // =========================================================================
  async function startLiveInvestigation(brand, location, website) {
    // 1. Immediately purge any leftover state from prior investigations
    clearInvestigationState();

    // 2. Immediately populate Header and Loading metadata with current user input
    if (headerBrandBadge) headerBrandBadge.textContent = brand;
    if (headerLocationTag) headerLocationTag.textContent = location;
    if (headerWebsiteLink) {
      if (website) {
        headerWebsiteLink.style.display = 'inline-flex';
        headerWebsiteLink.href = website.startsWith('http') ? website : `https://${website}`;
        if (headerWebsiteText) headerWebsiteText.textContent = website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      } else {
        headerWebsiteLink.style.display = 'none';
      }
    }

    if (loadingBrandTarget) loadingBrandTarget.textContent = brand;
    if (loadingLocationTarget) loadingLocationTarget.textContent = location;

    // 3. Switch to Loading View
    homePageWrapper.style.display = 'none';
    internalAppShell.style.display = 'none';
    viewLoading.style.display = 'flex';
    viewLoading.setAttribute('aria-hidden', 'false');
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Truthful Loading State — all stages active during single backend request
    stageStepSearch.className = 'stage-step active';
    stageStepMaps.className = 'stage-step active';
    stageStepNews.className = 'stage-step active';

    stagePillSearch.textContent = 'Querying';
    stagePillMaps.textContent = 'Checking';
    stagePillNews.textContent = 'Analyzing';

    stageBarSearch.style.width = '65%';
    stageBarMaps.style.width = '45%';
    stageBarNews.style.width = '30%';

    stageMsgSearch.textContent = 'Collecting Google organic search results and sponsored signals...';
    stageMsgMaps.textContent = `Cross-referencing nearby business listings in ${location}...`;
    stageMsgNews.textContent = `Gathering recent editorial news coverage for ${brand}...`;

    readyBanner.style.display = 'none';

    try {
      console.log(`[BrandGuard360] Initiating live investigation to ${API_BASE_URL}/api/investigate for ${brand}...`);

      const payload = {
        company_name: brand,
        website: website || "",
        location: location
      };

      const response = await fetch(`${API_BASE_URL}/api/investigate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log(`[BrandGuard360] Response status: ${response.status}`);

      if (!response.ok) {
        let errMessage = 'Investigation could not be completed. Try again.';
        try {
          const errData = await response.json();
          if (errData && errData.detail) {
            errMessage = typeof errData.detail === 'string' ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch (_) {}
        throw new Error(errMessage);
      }

      const realData = await response.json();
      console.log('[BrandGuard360] Live Backend Investigation Result:', realData);

      // Verify returned data integrity
      if (!realData || typeof realData !== 'object') {
        throw new Error('Received invalid data format from backend API.');
      }

      // Ensure critical fields exist
      realData.brand = realData.brand || realData.company_name || brand;
      realData.location = realData.location || realData.investigation_location || location;
      realData.website = realData.website || website || "";

      currentInvestigation = realData;

      // Add to session report history
      allReportsList.unshift({
        id: `inv-${Date.now()}`,
        brand: realData.brand,
        location: realData.location,
        website: realData.website || 'Not provided',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        signal: realData.overall_signal || (realData.anomaly_detected ? 'CONFLICTING' : 'CONFIRMED'),
        summary: (realData.executive_summary || realData.explanation || 'Investigation completed.').slice(0, 160) + '...',
        data: realData
      });

      // Mark all stages Complete
      stageStepSearch.className = 'stage-step completed';
      stageStepMaps.className = 'stage-step completed';
      stageStepNews.className = 'stage-step completed';

      stagePillSearch.textContent = 'Complete';
      stagePillMaps.textContent = 'Complete';
      stagePillNews.textContent = 'Complete';

      stageBarSearch.style.width = '100%';
      stageBarMaps.style.width = '100%';
      stageBarNews.style.width = '100%';

      stageMsgSearch.textContent = 'Search findings cataloged.';
      stageMsgMaps.textContent = 'Maps presence verified.';
      stageMsgNews.textContent = 'Contextual coverage synthesized.';

      // Show Investigation Ready banner
      readyBanner.style.display = 'flex';

      btnViewFindings.onclick = () => {
        renderInvestigationDossier(currentInvestigation);
        navigateToView('overview');
      };

      // Automatically transition after brief pause for smooth UX
      setTimeout(() => {
        renderInvestigationDossier(currentInvestigation);
        navigateToView('overview');
      }, 700);

    } catch (err) {
      console.error('[BrandGuard360] Investigation Error:', err);
      viewLoading.style.display = 'none';
      internalAppShell.style.display = 'flex';
      
      const errorHeadline = document.querySelector('#viewError .error-headline');
      const errorDesc = document.querySelector('#viewError .error-description');
      if (errorHeadline) errorHeadline.textContent = 'Investigation Could Not Be Completed';
      if (errorDesc) errorDesc.textContent = err.message || 'Something went wrong while executing the investigation. Public sources could not be queried or the server timed out.';
      
      navigateToView('error');
    } finally {
      // Re-enable form button
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `
        <span class="btn-icon" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </span>
        <span class="btn-text">Investigate Brand</span>
      `;
    }
  }

  // =========================================================================
  // PARSE STRUCTURED WEB SEARCH REPORT
  // =========================================================================
  function parseWebSearchReport(reportText, brand, website, sourceLinks = []) {
    const result = {
      ownerStatus: 'Not provided',
      ownerDomain: website ? website.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : 'Not provided',
      ownerPosition: '',
      ownerExplanation: '',
      organicResults: [],
      advertisements: [],
      mentionedBrands: [],
      potentialCompetitors: [],
      webSummary: '',
      rawText: reportText || ''
    };

    if (!reportText) return result;

    const text = reportText.replace(/\r\n/g, '\n');

    // Parse Owner Website section
    const ownerMatch = text.match(/Owner Website[\s\S]*?(?=(?:Organic Results|Advertisements|Potential Competitors|Web Summary|$))/i);
    if (ownerMatch) {
      const ownerBlock = ownerMatch[0];
      const statusMatch = ownerBlock.match(/Status:\s*([^\n]+)/i);
      if (statusMatch) result.ownerStatus = statusMatch[1].trim();

      const domainMatch = ownerBlock.match(/Domain:\s*([^\n]+)/i);
      if (domainMatch && domainMatch[1].trim()) result.ownerDomain = domainMatch[1].trim();

      const posMatch = ownerBlock.match(/Position:\s*([^\n]+)/i);
      if (posMatch) result.ownerPosition = posMatch[1].trim();
    }

    // Parse Web Summary section
    const summaryMatch = text.match(/Web Summary\s*[:\n]\s*([\s\S]*?)(?=(?:$|\n---|\n===))/i);
    if (summaryMatch) {
      result.webSummary = summaryMatch[1].trim();
    }

    // Parse Organic Results section
    const organicMatch = text.match(/Organic Results[\s\S]*?(?=(?:Advertisements|Potential Competitors|Web Summary|$))/i);
    if (organicMatch) {
      const organicBlock = organicMatch[0];
      const itemRegex = /(\d+)\.\s*([^\n]+)(?:[\s\S]*?Domain:\s*([^\n]+))?(?:[\s\S]*?Type:\s*([^\n]+))?(?:[\s\S]*?Reason:\s*([^\n]+))?/gi;
      let match;
      while ((match = itemRegex.exec(organicBlock)) !== null) {
        const pos = parseInt(match[1], 10);
        const title = (match[2] || '').trim();
        const domain = (match[3] || '').trim();
        const type = (match[4] || 'Organic').trim();
        const reason = (match[5] || '').trim();

        // Match source link if available
        let matchedUrl = '';
        if (domain) {
          matchedUrl = sourceLinks.find(u => u.toLowerCase().includes(domain.toLowerCase())) || '';
        }
        if (!matchedUrl && pos <= sourceLinks.length) {
          matchedUrl = sourceLinks[pos - 1] || '';
        }

        result.organicResults.push({
          position: pos,
          title: title,
          domain: domain || (matchedUrl ? safeGetDomain(matchedUrl) : 'Google Search Result'),
          type: type,
          snippet: reason || title,
          url: matchedUrl,
          signal: 'Positive'
        });
      }
    }

    // Parse Advertisements section
    const adsMatch = text.match(/Advertisements[\s\S]*?(?=(?:Potential Competitors|Web Summary|$))/i);
    if (adsMatch) {
      const adsBlock = adsMatch[0];
      if (!adsBlock.toLowerCase().includes('no ads found')) {
        const adItemRegex = /(\d+)\.\s*([^\n]+)(?:[\s\S]*?Domain:\s*([^\n]+))?(?:[\s\S]*?Type:\s*([^\n]+))?(?:[\s\S]*?Reason:\s*([^\n]+))?/gi;
        let adMatch;
        while ((adMatch = adItemRegex.exec(adsBlock)) !== null) {
          result.advertisements.push({
            advertiser: (adMatch[2] || '').trim(),
            domain: (adMatch[3] || '').trim(),
            type: (adMatch[4] || 'Sponsored').trim(),
            text: (adMatch[5] || '').trim(),
            url: '',
            signal: 'Review Needed'
          });
        }
      }
    }

    // Parse Potential Competitors section
    const compMatch = text.match(/Potential Competitors[\s\S]*?(?=(?:Web Summary|$))/i);
    if (compMatch) {
      const compBlock = compMatch[0];
      const mentionedMatch = compBlock.match(/Mentioned:\s*([^\n]+)/i);
      if (mentionedMatch) {
        const raw = mentionedMatch[1].trim();
        if (raw && !raw.toLowerCase().includes('none')) {
          result.mentionedBrands = raw.split(',').map(s => s.trim()).filter(Boolean);
        }
      }

      const suspiciousMatch = compBlock.match(/Suspicious:\s*([^\n]+)/i);
      if (suspiciousMatch) {
        const raw = suspiciousMatch[1].trim();
        if (raw && !raw.toLowerCase().includes('none')) {
          result.potentialCompetitors = raw.split(',').map(name => ({
            name: name.trim(),
            domain: '',
            note: 'Flagged for closer review based on search evidence.'
          })).filter(c => c.name);
        }
      }
    }

    return result;
  }

  function safeGetDomain(urlStr) {
    try {
      return new URL(urlStr).hostname;
    } catch (_) {
      return urlStr;
    }
  }

  // =========================================================================
  // RENDER REAL INVESTIGATION DOSSIER (Screens 3 to 6)
  // =========================================================================
  function renderInvestigationDossier(data) {
    if (!data) return;

    const sourceLinks = Array.isArray(data.source_links) ? data.source_links : [];
    const parsedSearch = parseWebSearchReport(data.web_search_report, data.brand, data.website, sourceLinks);

    // -------------------------------------------------------------
    // TOP HEADER METADATA (LIVE TARGET IDENTITY)
    // -------------------------------------------------------------
    if (headerBrandBadge) headerBrandBadge.textContent = data.brand;
    if (headerLocationTag) headerLocationTag.textContent = data.location;
    if (headerWebsiteLink) {
      if (data.website) {
        headerWebsiteLink.style.display = 'inline-flex';
        headerWebsiteLink.href = data.website.startsWith('http') ? data.website : `https://${data.website}`;
        if (headerWebsiteText) headerWebsiteText.textContent = data.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      } else {
        headerWebsiteLink.style.display = 'none';
      }
    }

    // -------------------------------------------------------------
    // TRUTHFUL BADGE COUNTS
    // Only display counts when real items exist; otherwise hide
    // -------------------------------------------------------------
    const organicCount = parsedSearch.organicResults.length;
    const mapsCount = data.maps_findings ? 1 : 0;
    const newsCount = sourceLinks.length;

    if (sideBadgeSearch) {
      if (organicCount > 0) {
        sideBadgeSearch.textContent = organicCount;
        sideBadgeSearch.style.display = 'inline-block';
      } else {
        sideBadgeSearch.style.display = 'none';
      }
    }
    if (segCountSearch) {
      if (organicCount > 0) {
        segCountSearch.textContent = organicCount;
        segCountSearch.style.display = 'inline-block';
      } else {
        segCountSearch.style.display = 'none';
      }
    }

    if (sideBadgeMaps) {
      if (mapsCount > 0) {
        sideBadgeMaps.textContent = mapsCount;
        sideBadgeMaps.style.display = 'inline-block';
      } else {
        sideBadgeMaps.style.display = 'none';
      }
    }
    if (segCountMaps) {
      if (mapsCount > 0) {
        segCountMaps.textContent = mapsCount;
        segCountMaps.style.display = 'inline-block';
      } else {
        segCountMaps.style.display = 'none';
      }
    }

    if (sideBadgeNews) {
      if (newsCount > 0) {
        sideBadgeNews.textContent = newsCount;
        sideBadgeNews.style.display = 'inline-block';
      } else {
        sideBadgeNews.style.display = 'none';
      }
    }
    if (segCountNews) {
      if (newsCount > 0) {
        segCountNews.textContent = newsCount;
        segCountNews.style.display = 'inline-block';
      } else {
        segCountNews.style.display = 'none';
      }
    }

    // -------------------------------------------------------------
    // SCREEN 3: INVESTIGATION OVERVIEW
    // -------------------------------------------------------------
    if (ovBrandName) ovBrandName.textContent = data.brand;
    if (ovLocation) ovLocation.textContent = data.location;
    if (ovWebsite && ovWebsiteLink) {
      if (data.website) {
        ovWebsite.textContent = data.website;
        ovWebsiteLink.href = data.website.startsWith('http') ? data.website : `https://${data.website}`;
        if (ovWebsiteSep) ovWebsiteSep.style.display = 'inline';
        if (ovWebsiteItem) ovWebsiteItem.style.display = 'inline';
      } else {
        ovWebsite.textContent = '';
        ovWebsiteLink.removeAttribute('href');
        if (ovWebsiteSep) ovWebsiteSep.style.display = 'none';
        if (ovWebsiteItem) ovWebsiteItem.style.display = 'none';
      }
    }

    // Overall Brand Signal (CONFIRMED / CONFLICTING / UNKNOWN)
    const isAnomaly = Boolean(data.anomaly_detected);
    const overallSignal = (data.overall_signal || (isAnomaly ? 'CONFLICTING' : 'CONFIRMED')).toUpperCase();
    const signalClass = overallSignal === 'CONFIRMED' 
      ? 'signal-confirmed' 
      : (overallSignal === 'CONFLICTING' ? 'signal-conflicting' : 'signal-unknown');

    if (ovOverallSignalBadge) {
      ovOverallSignalBadge.textContent = overallSignal;
      ovOverallSignalBadge.className = `signal-status-pill ${signalClass}`;
    }
    if (ovOverallSignalExplanation) {
      ovOverallSignalExplanation.textContent = data.explanation || data.executive_summary || 'Investigation completed across Google Search, Maps, and News.';
    }

    // Source Summaries on Overview
    if (ovSearchSignal) {
      ovSearchSignal.textContent = isAnomaly ? 'Review Needed' : 'Positive';
      ovSearchSignal.className = `status-pill status-${isAnomaly ? 'warning' : 'positive'}`;
    }
    if (ovSearchExplanation) {
      const searchSummaryText = data.organic_findings || parsedSearch.webSummary || (data.web_search_report ? data.web_search_report.slice(0, 220) + '...' : 'Search evidence processed.');
      ovSearchExplanation.textContent = searchSummaryText;
    }

    if (ovMapsSignal) {
      ovMapsSignal.textContent = isAnomaly ? 'Review Needed' : 'Positive';
      ovMapsSignal.className = `status-pill status-${isAnomaly ? 'warning' : 'positive'}`;
    }
    if (ovMapsExplanation) {
      ovMapsExplanation.textContent = data.maps_findings || 'No specific Maps findings returned.';
    }

    if (ovNewsSignal) {
      ovNewsSignal.textContent = isAnomaly ? 'Review Needed' : 'Positive';
      ovNewsSignal.className = `status-pill status-${isAnomaly ? 'warning' : 'positive'}`;
    }
    if (ovNewsExplanation) {
      ovNewsExplanation.textContent = data.news_findings || 'No concerning news coverage identified.';
    }

    // Key Findings Grid (Strictly Real Facts)
    if (ovKeyFindingsGrid) {
      ovKeyFindingsGrid.innerHTML = '';
      const ownerStatusText = data.owner_website_status || parsedSearch.ownerStatus || (data.website ? 'Found' : 'Not provided');
      const hasAds = parsedSearch.advertisements.length > 0 || (data.advertisement_findings && !data.advertisement_findings.toLowerCase().includes('no ads found'));

      const keyFindings = [
        {
          source: 'Search',
          title: 'Owner Website Status',
          status: ownerStatusText === 'Found' ? 'Positive' : (ownerStatusText === 'Not provided' ? 'Neutral' : 'Review Needed'),
          explanation: `Status: ${ownerStatusText}${data.website ? ` | Domain: ${data.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '')}` : ''}${parsedSearch.ownerPosition ? ` | Position: ${parsedSearch.ownerPosition}` : ''}`,
          url: data.website || (sourceLinks.length > 0 ? sourceLinks[0] : '')
        },
        {
          source: 'Search',
          title: 'Advertisements',
          status: hasAds ? 'Review Needed' : 'Positive',
          explanation: hasAds ? (data.advertisement_findings || `${parsedSearch.advertisements.length} sponsored ads observed.`) : 'No sponsored ads observed bidding against the brand query.',
          url: ''
        },
        {
          source: 'Maps',
          title: 'Maps Presence',
          status: isAnomaly ? 'Review Needed' : 'Positive',
          explanation: data.maps_findings || 'Local presence assessed from Google Maps signals.',
          url: ''
        },
        {
          source: 'News',
          title: 'News Context',
          status: isAnomaly ? 'Review Needed' : 'Positive',
          explanation: data.news_findings || 'Contextual news reporting evaluated.',
          url: sourceLinks.length > 0 ? sourceLinks[0] : ''
        }
      ];

      keyFindings.forEach(kf => {
        const card = document.createElement('div');
        card.className = 'finding-card';
        const stClass = kf.status === 'Positive' ? 'positive' : (kf.status === 'Review Needed' ? 'warning' : 'neutral');
        card.innerHTML = `
          <div class="finding-card-header">
            <h3 class="finding-title">${escapeHtml(kf.title)}</h3>
            <span class="status-pill status-${stClass}">${escapeHtml(kf.status)}</span>
          </div>
          <p class="finding-desc">${escapeHtml(kf.explanation)}</p>
          <div class="finding-footer">
            <span class="finding-source-tag">${escapeHtml(kf.source)}</span>
            ${kf.url ? `
              <a href="${escapeHtml(kf.url)}" target="_blank" rel="noopener noreferrer" class="btn-view-source">
                <span>View Source</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            ` : ''}
          </div>
        `;
        ovKeyFindingsGrid.appendChild(card);
      });
    }

    // Executive Summary
    if (ovExecutiveSummaryText) {
      ovExecutiveSummaryText.textContent = data.executive_summary || data.explanation || 'Investigation completed across Google Search, Google Maps, and Google News.';
    }

    // -------------------------------------------------------------
    // SCREEN 4: GOOGLE SEARCH
    // -------------------------------------------------------------
    if (searchSourceSignalBadge) {
      searchSourceSignalBadge.textContent = isAnomaly ? 'Review Needed' : 'Positive';
      searchSourceSignalBadge.className = `status-pill status-${isAnomaly ? 'warning' : 'positive'}`;
    }

    // Owner Website Panel
    const ownerStatusVal = data.owner_website_status || parsedSearch.ownerStatus || (data.website ? 'Found' : 'Not provided');
    if (searchOwnerStatusPill) {
      searchOwnerStatusPill.textContent = ownerStatusVal;
      searchOwnerStatusPill.className = `status-pill status-${ownerStatusVal === 'Found' ? 'positive' : (ownerStatusVal === 'Not provided' ? 'neutral' : 'warning')}`;
    }
    if (searchOwnerDomain) {
      searchOwnerDomain.textContent = data.website ? data.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '') : (parsedSearch.ownerDomain || 'Not provided');
    }
    if (searchOwnerPosition) {
      if (parsedSearch.ownerPosition) {
        searchOwnerPosition.textContent = parsedSearch.ownerPosition.startsWith('#') ? parsedSearch.ownerPosition : `#${parsedSearch.ownerPosition}`;
        searchOwnerPosition.style.display = 'inline-block';
      } else {
        searchOwnerPosition.style.display = 'none';
      }
    }
    if (searchOwnerExplanation) {
      searchOwnerExplanation.textContent = parsedSearch.webSummary || data.organic_findings || 'Owner domain standing cataloged from organic placements.';
    }

    // Search Queries Section (Driven directly by response.search_queries)
    if (searchQueriesSection && searchQueriesContainer) {
      const queries = Array.isArray(data.search_queries) ? data.search_queries : [];
      if (queries.length > 0) {
        searchQueriesSection.style.display = 'block';
        searchQueriesContainer.innerHTML = '';
        queries.forEach(q => {
          const chip = document.createElement('span');
          chip.className = 'neutral-tag-chip';
          chip.textContent = q;
          searchQueriesContainer.appendChild(chip);
        });
      } else {
        searchQueriesSection.style.display = 'none';
        searchQueriesContainer.innerHTML = '';
      }
    }

    // Organic Results
    if (searchOrganicContainer) {
      searchOrganicContainer.innerHTML = '';
      if (parsedSearch.organicResults.length > 0) {
        parsedSearch.organicResults.forEach(item => {
          const row = document.createElement('div');
          row.className = 'organic-result-item';
          row.innerHTML = `
            <div class="result-pos-col">#${item.position}</div>
            <div class="result-content-col">
              <div class="result-header-row">
                <div class="result-meta-left">
                  <span class="result-domain">${escapeHtml(item.domain)}</span>
                  <span class="result-type-badge">${escapeHtml(item.type)}</span>
                </div>
                <span class="status-pill status-positive">Observed</span>
              </div>
              ${item.url ? `
                <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="result-title-link">
                  ${escapeHtml(item.title)}
                </a>
              ` : `
                <div class="result-title-link" style="cursor: default;">${escapeHtml(item.title)}</div>
              `}
              <p class="result-snippet">${escapeHtml(item.snippet)}</p>
              <div class="result-footer-row">
                <span class="finding-source-tag">Google Search Placement</span>
                ${item.url ? `
                  <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="btn-view-source">
                    <span>View Source</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                ` : `
                  <span class="field-validation-msg" style="display: inline; font-size: 11px;">Public Search Citation</span>
                `}
              </div>
            </div>
          `;
          searchOrganicContainer.appendChild(row);
        });
      } else if (data.organic_findings || data.web_search_report) {
        const textContent = data.organic_findings || data.web_search_report;
        const card = document.createElement('div');
        card.className = 'organic-result-item';
        card.innerHTML = `
          <div class="result-content-col" style="width: 100%;">
            <div class="result-header-row">
              <span class="result-domain">${escapeHtml(data.brand)} — Organic Search Findings</span>
              <span class="status-pill status-positive">Analyzed</span>
            </div>
            <div class="result-snippet" style="white-space: pre-line; line-height: 1.6; margin-top: 10px;">${escapeHtml(textContent)}</div>
          </div>
        `;
        searchOrganicContainer.appendChild(card);
      } else {
        searchOrganicContainer.innerHTML = `
          <div class="empty-state-box">
            <div class="empty-state-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <h3 class="empty-state-title">No Organic Results Returned</h3>
            <p class="empty-state-text">No organic search placements were returned for this brand in the queried location.</p>
          </div>
        `;
      }
    }

    // Advertisements
    if (searchAdsContainer) {
      searchAdsContainer.innerHTML = '';
      if (parsedSearch.advertisements.length > 0) {
        parsedSearch.advertisements.forEach(ad => {
          const adCard = document.createElement('div');
          adCard.className = 'ad-card-item';
          adCard.innerHTML = `
            <div class="ad-top-row">
              <div class="ad-identity">
                <span class="ad-sponsor-label">SPONSORED</span>
                <span class="ad-advertiser-name">${escapeHtml(ad.advertiser)}</span>
                <span class="ad-domain-text">${escapeHtml(ad.domain)}</span>
              </div>
              <span class="status-pill status-warning">${escapeHtml(ad.signal)}</span>
            </div>
            <p class="ad-copy-text">${escapeHtml(ad.text)}</p>
            <div class="result-footer-row">
              <span class="finding-source-tag">Google Sponsored Ads</span>
            </div>
          `;
          searchAdsContainer.appendChild(adCard);
        });
      } else if (data.advertisement_findings && !data.advertisement_findings.toLowerCase().includes('no ads found')) {
        const adCard = document.createElement('div');
        adCard.className = 'ad-card-item';
        adCard.innerHTML = `
          <div class="ad-top-row">
            <div class="ad-identity">
              <span class="ad-sponsor-label">COMMERCIAL EVIDENCE</span>
              <span class="ad-advertiser-name">${escapeHtml(data.brand)}</span>
            </div>
            <span class="status-pill status-warning">Observed</span>
          </div>
          <p class="ad-copy-text">${escapeHtml(data.advertisement_findings)}</p>
          <div class="result-footer-row">
            <span class="finding-source-tag">Google Sponsored Ads</span>
          </div>
        `;
        searchAdsContainer.appendChild(adCard);
      } else {
        searchAdsContainer.innerHTML = `
          <div class="empty-state-box">
            <div class="empty-state-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 class="empty-state-title">No Ads Found</h3>
            <p class="empty-state-text">No sponsored advertisements were returned for this investigation.</p>
          </div>
        `;
      }
    }

    // Mentioned Brands
    if (searchMentionedBrandsCluster) {
      searchMentionedBrandsCluster.innerHTML = '';
      const mentioned = parsedSearch.mentionedBrands.length > 0 ? parsedSearch.mentionedBrands : [data.brand];
      mentioned.forEach(name => {
        const chip = document.createElement('span');
        chip.className = 'neutral-tag-chip';
        chip.textContent = name;
        searchMentionedBrandsCluster.appendChild(chip);
      });
    }

    // Potential Competitors
    if (searchPotentialCompetitorsList) {
      searchPotentialCompetitorsList.innerHTML = '';
      if (parsedSearch.potentialCompetitors.length > 0) {
        parsedSearch.potentialCompetitors.forEach(comp => {
          const item = document.createElement('div');
          item.className = 'competitor-item-card';
          item.innerHTML = `
            <div class="comp-header">
              <span class="comp-name">${escapeHtml(comp.name)}</span>
              <span class="comp-domain">${escapeHtml(comp.domain || '')}</span>
            </div>
            <p class="comp-note">${escapeHtml(comp.note)}</p>
          `;
          searchPotentialCompetitorsList.appendChild(item);
        });
      } else {
        searchPotentialCompetitorsList.innerHTML = `
          <p class="neutral-box-desc" style="margin-bottom: 0;">No suspicious competitor entities identified from public evidence.</p>
        `;
      }
    }

    // -------------------------------------------------------------
    // SCREEN 5: GOOGLE MAPS
    // -------------------------------------------------------------
    if (mapsSourceSignalBadge) {
      mapsSourceSignalBadge.textContent = isAnomaly ? 'Review Needed' : 'Positive';
      mapsSourceSignalBadge.className = `status-pill status-${isAnomaly ? 'warning' : 'positive'}`;
    }
    if (mapsFindingsSummary) {
      mapsFindingsSummary.textContent = data.maps_findings || 'Google Maps location evidence processed.';
    }
    if (mapsCoordTag) mapsCoordTag.textContent = data.location;
    if (mapTargetMarketText) mapTargetMarketText.textContent = `${data.brand} — ${data.location}`;

    if (mapsListingsContainer) {
      mapsListingsContainer.innerHTML = '';
      if (mapPinsLayer) mapPinsLayer.innerHTML = '';

      if (mapsListingCount) {
        mapsListingCount.textContent = '1 finding';
        mapsListingCount.style.display = 'inline-block';
      }

      // Find if any source link is a maps link
      const mapsUrl = sourceLinks.find(link => link.toLowerCase().includes('maps.google') || link.toLowerCase().includes('google.com/maps')) || '';

      const mapsCard = document.createElement('div');
      mapsCard.className = 'map-listing-card highlighted';
      mapsCard.innerHTML = `
        <div class="listing-top-row">
          <h4 class="listing-name">${escapeHtml(data.brand)} Local Assessment</h4>
          <span class="naming-signal-tag normal">Verified Surface</span>
        </div>
        <div class="listing-category-text">Google Maps Evidence</div>
        <div class="listing-address-row">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${escapeHtml(data.location)}</span>
        </div>
        <p style="font-size: 13px; color: var(--text-secondary); margin: 10px 0; line-height: 1.5;">
          ${escapeHtml(data.maps_findings || 'No suspicious or duplicate listings detected in target vicinity.')}
        </p>
        <div class="listing-bottom-row" style="margin-top: 10px;">
          <span class="finding-source-tag">Target Location: ${escapeHtml(data.location)}</span>
          ${mapsUrl ? `
            <a href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener noreferrer" class="btn-view-source">
              <span>View On Maps</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          ` : ''}
        </div>
      `;
      mapsListingsContainer.appendChild(mapsCard);
    }

    // -------------------------------------------------------------
    // SCREEN 6: GOOGLE NEWS
    // -------------------------------------------------------------
    if (newsSourceSignalBadge) {
      newsSourceSignalBadge.textContent = isAnomaly ? 'Review Needed' : 'Positive';
      newsSourceSignalBadge.className = `status-pill status-${isAnomaly ? 'warning' : 'positive'}`;
    }
    if (newsFindingsSummary) {
      newsFindingsSummary.textContent = data.news_findings || 'Google News editorial context synthesized.';
    }

    if (newsArticlesContainer) {
      newsArticlesContainer.innerHTML = '';
      if (sourceLinks.length > 0) {
        sourceLinks.forEach((link, idx) => {
          const artCard = document.createElement('div');
          artCard.className = 'news-article-card';
          const hostname = safeGetDomain(link);
          artCard.innerHTML = `
            <div class="article-top-meta">
              <div class="article-pub-row">
                <span class="article-publisher">${escapeHtml(hostname)}</span>
                <span class="meta-sep">,</span>
                <span class="article-date">Public Citation #${idx + 1}</span>
              </div>
              <span class="status-pill status-positive">Verified Source</span>
            </div>
            <h3 class="article-headline">
              <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link)}</a>
            </h3>
            <p class="article-summary-text">${escapeHtml(data.news_findings || 'Relevant public citation reviewed during investigation.')}</p>
            <div class="article-bottom-row">
              <span class="finding-source-tag">Public Citation</span>
              <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" class="btn-view-source">
                <span>View Source</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          `;
          newsArticlesContainer.appendChild(artCard);
        });
      } else {
        newsArticlesContainer.innerHTML = `
          <div class="empty-state-box">
            <div class="empty-state-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
            </div>
            <h3 class="empty-state-title">No Source Links Returned</h3>
            <p class="empty-state-text">${escapeHtml(data.news_findings || 'No specific news links were returned for this brand.')}</p>
          </div>
        `;
      }
    }
  }

  // =========================================================================
  // SCREEN 7: REPORTS LISTING (TRUTHFUL SESSION-ONLY PERSISTENCE)
  // =========================================================================
  function renderReportsTable() {
    if (!reportsTableBody) return;
    reportsTableBody.innerHTML = '';

    const filtered = allReportsList.filter(rep => {
      const matchSignal = currentFilter === 'all' || rep.signal === currentFilter;
      const query = currentSearchQuery.toLowerCase();
      const matchQuery = !query || 
        rep.brand.toLowerCase().includes(query) || 
        rep.location.toLowerCase().includes(query) || 
        rep.summary.toLowerCase().includes(query);
      return matchSignal && matchQuery;
    });

    if (filtered.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td colspan="5" style="text-align: center; padding: 40px;">
          <div class="empty-state-title" style="margin-bottom: 4px;">No Saved Investigations Yet</div>
          <div class="empty-state-text">Investigations performed during this session will appear here. No historical mock data.</div>
        </td>
      `;
      reportsTableBody.appendChild(tr);
      return;
    }

    filtered.forEach(rep => {
      const signalClass = rep.signal === 'CONFIRMED' ? 'signal-confirmed' : (rep.signal === 'CONFLICTING' ? 'signal-conflicting' : 'signal-unknown');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <span class="brand-cell-name">${escapeHtml(rep.brand)}</span>
          <span class="brand-cell-site">${escapeHtml(rep.website)}</span>
        </td>
        <td>${escapeHtml(rep.location)}</td>
        <td>
          <span class="signal-status-pill ${signalClass}">${escapeHtml(rep.signal)}</span>
        </td>
        <td>${escapeHtml(rep.date)}</td>
        <td style="text-align: right;">
          <button type="button" class="btn-table-view" data-rep-id="${escapeHtml(rep.id)}">
            <span>View Report</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </td>
      `;

      // Click to open previous investigation from session
      const viewBtn = tr.querySelector('.btn-table-view');
      if (viewBtn) {
        viewBtn.addEventListener('click', () => {
          clearInvestigationState();
          currentInvestigation = rep.data;
          renderInvestigationDossier(currentInvestigation);
          navigateToView('overview');
        });
      }

      reportsTableBody.appendChild(tr);
    });
  }

  // Report Search Input Filter
  if (inputReportSearch) {
    inputReportSearch.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim();
      renderReportsTable();
    });
  }

  // Report Signal Tabs Filter
  if (reportSignalFilters) {
    const filterTabs = reportSignalFilters.querySelectorAll('.btn-filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentFilter = tab.dataset.filter;
        renderReportsTable();
      });
    });
  }

  // =========================================================================
  // PROFESSIONAL INVESTIGATION PDF GENERATOR (A4 DARK-THEMED RESEARCH DOSSIER)
  // =========================================================================
  function generateInvestigationPDF(data) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('PDF generator library not loaded.');
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2); // 180mm
    const bottomLimit = 268;

    let currentY = margin;

    function drawBackground() {
      doc.setFillColor(11, 15, 23); // #0b0f17 deep navy-black
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    function drawMiniHeader() {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // #64748b
      doc.text('BRANDGUARD360  |  INVESTIGATION REPORT', margin, 12);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // #94a3b8
      const brandLabel = `${data.brand || 'Brand'} — ${data.location || 'Location'}`;
      doc.text(brandLabel, pageWidth - margin - doc.getTextWidth(brandLabel), 12);

      doc.setDrawColor(30, 41, 59); // #1e293b
      doc.setLineWidth(0.3);
      doc.line(margin, 15, pageWidth - margin, 15);
    }

    function checkPageBreak(neededHeight) {
      if (currentY + neededHeight > bottomLimit) {
        doc.addPage();
        drawBackground();
        drawMiniHeader();
        currentY = 22;
        return true;
      }
      return false;
    }

    function sanitizeText(str) {
      if (!str) return '';
      return String(str).replace(/[•]/g, '-').replace(/\r\n/g, '\n');
    }

    // Initial page background
    drawBackground();

    // -------------------------------------------------------------
    // TOP HEADER
    // -------------------------------------------------------------
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(248, 250, 252);
    doc.text('BrandGuard', margin, currentY + 6);
    const brandGuardWidth = doc.getTextWidth('BrandGuard');
    doc.setTextColor(56, 189, 248); // #38bdf8
    doc.text('360', margin + brandGuardWidth, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('Investigation Report', margin, currentY + 13);

    // Date & Mode on right
    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    const dateLabel = `Date: ${dateStr}`;
    doc.text(dateLabel, pageWidth - margin - doc.getTextWidth(dateLabel), currentY + 6);
    const statusLabel = 'Live Investigation Dossier';
    doc.text(statusLabel, pageWidth - margin - doc.getTextWidth(statusLabel), currentY + 12);

    currentY += 19;

    // Divider
    doc.setDrawColor(41, 53, 72);
    doc.setLineWidth(0.4);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 6;

    // -------------------------------------------------------------
    // METADATA CARD (Brand, Location, Website, Sources)
    // -------------------------------------------------------------
    const metaCardHeight = 28;
    doc.setFillColor(22, 30, 46); // #161e2e
    doc.setDrawColor(41, 53, 72);
    doc.roundedRect(margin, currentY, contentWidth, metaCardHeight, 2, 2, 'FD');

    const col1X = margin + 6;
    const col2X = margin + 62;
    const col3X = margin + 120;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('INVESTIGATED BRAND', col1X, currentY + 7);
    doc.text('INVESTIGATION LOCATION', col2X, currentY + 7);
    doc.text('OWNER WEBSITE', col3X, currentY + 7);

    doc.setFontSize(10.5);
    doc.setTextColor(248, 250, 252);
    doc.text(data.brand || 'Not specified', col1X, currentY + 14);
    doc.text(data.location || 'Not specified', col2X, currentY + 14);

    const websiteDisplay = data.website ? data.website : 'Not provided';
    doc.text(websiteDisplay.length > 28 ? websiteDisplay.slice(0, 26) + '...' : websiteDisplay, col3X, currentY + 14);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Sources Used: Google Search, Google Maps, Google News', col1X, currentY + 22);
    doc.text('Engine: Google ADK + SerpApi', col2X, currentY + 22);
    doc.text('Evaluation Policy: Evidence-Based (Zero Numeric Scores)', col3X, currentY + 22);

    currentY += metaCardHeight + 8;

    // -------------------------------------------------------------
    // SECTION: OVERALL BRAND SIGNAL
    // -------------------------------------------------------------
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(56, 189, 248);
    doc.text('CROSS-SOURCE VERIFICATION', margin, currentY);
    currentY += 5;

    doc.setFontSize(13);
    doc.setTextColor(248, 250, 252);
    doc.text('Overall Brand Signal', margin, currentY);
    currentY += 5;

    const rawSignal = (data.overall_signal || (data.anomaly_detected ? 'CONFLICTING' : 'CONFIRMED')).toUpperCase();
    const signal = ['CONFIRMED', 'CONFLICTING', 'UNKNOWN'].includes(rawSignal) ? rawSignal : 'UNKNOWN';

    let pillBg = [16, 44, 28];
    let pillBorder = [34, 197, 94];
    let pillText = [74, 222, 128];

    if (signal === 'CONFLICTING') {
      pillBg = [69, 26, 3];
      pillBorder = [245, 158, 11];
      pillText = [251, 191, 36];
    } else if (signal === 'UNKNOWN') {
      pillBg = [30, 41, 59];
      pillBorder = [100, 116, 139];
      pillText = [203, 213, 225];
    }

    const explanationText = sanitizeText(data.explanation || data.executive_summary || 'Investigation completed across Google Search, Google Maps, and Google News.');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const expLines = doc.splitTextToSize(explanationText, contentWidth - 12);
    const expHeight = expLines.length * 4.4;
    const signalCardHeight = 22 + expHeight;

    checkPageBreak(signalCardHeight);

    doc.setFillColor(22, 30, 46);
    doc.setDrawColor(41, 53, 72);
    doc.roundedRect(margin, currentY, contentWidth, signalCardHeight, 2, 2, 'FD');

    // Draw pill
    const pillWidth = doc.getTextWidth(signal) + 12;
    const pillHeight = 7;
    doc.setFillColor(pillBg[0], pillBg[1], pillBg[2]);
    doc.setDrawColor(pillBorder[0], pillBorder[1], pillBorder[2]);
    doc.roundedRect(margin + 6, currentY + 5, pillWidth, pillHeight, 1.5, 1.5, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(pillText[0], pillText[1], pillText[2]);
    doc.text(signal, margin + 6 + 6, currentY + 10);

    // Explanation text
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(226, 232, 240);
    doc.text(expLines, margin + 6, currentY + 18);

    currentY += signalCardHeight + 8;

    // -------------------------------------------------------------
    // SECTION: SOURCE OVERVIEW
    // -------------------------------------------------------------
    checkPageBreak(35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(56, 189, 248);
    doc.text('EVIDENCE CHANNELS', margin, currentY);
    currentY += 5;

    doc.setFontSize(13);
    doc.setTextColor(248, 250, 252);
    doc.text('Source Overview', margin, currentY);
    currentY += 6;

    const sources = [
      {
        name: 'Google Search',
        status: data.owner_website_status || 'Found',
        findings: sanitizeText(data.organic_findings || data.web_search_report || 'Search evidence processed.')
      },
      {
        name: 'Google Maps',
        status: data.maps_findings ? 'Observed' : 'No findings',
        findings: sanitizeText(data.maps_findings || 'No Maps findings returned.')
      },
      {
        name: 'Google News',
        status: (data.source_links && data.source_links.length > 0) ? `${data.source_links.length} citations` : 'Evaluated',
        findings: sanitizeText(data.news_findings || 'No News findings returned.')
      }
    ];

    sources.forEach((src) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      const fLines = doc.splitTextToSize(src.findings.slice(0, 320), contentWidth - 14);
      const boxH = 14 + (fLines.length * 4.2);

      checkPageBreak(boxH + 4);

      doc.setFillColor(17, 24, 39);
      doc.setDrawColor(41, 53, 72);
      doc.roundedRect(margin, currentY, contentWidth, boxH, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(248, 250, 252);
      doc.text(src.name, margin + 6, currentY + 7);

      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(src.status, pageWidth - margin - 6 - doc.getTextWidth(src.status), currentY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225);
      doc.text(fLines, margin + 6, currentY + 13);

      currentY += boxH + 4;
    });

    currentY += 4;

    // -------------------------------------------------------------
    // SECTION: KEY FINDINGS
    // -------------------------------------------------------------
    checkPageBreak(35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(56, 189, 248);
    doc.text('STRUCTURED SUMMARY', margin, currentY);
    currentY += 5;

    doc.setFontSize(13);
    doc.setTextColor(248, 250, 252);
    doc.text('Key Findings', margin, currentY);
    currentY += 6;

    const findingsList = [
      { label: 'Owner Website Status', value: data.owner_website_status || (data.website ? 'Found' : 'Not provided') },
      { label: 'Advertisement Findings', value: data.advertisement_findings || 'No advertisement findings returned.' },
      { label: 'Maps Findings', value: data.maps_findings || 'No Maps findings returned.' },
      { label: 'News Findings', value: data.news_findings || 'No News findings returned.' },
      { label: 'Anomaly Detected', value: data.anomaly_detected ? 'Yes (Conflicting signals observed)' : 'No (Consistent presence observed)' },
      { label: 'Investigation Summary', value: data.executive_summary || data.explanation || 'Investigation completed.' }
    ];

    findingsList.forEach((kf, idx) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      const cleanVal = sanitizeText(kf.value);
      const valLines = doc.splitTextToSize(cleanVal, contentWidth - 55);
      const rowH = Math.max(8, valLines.length * 4.2 + 4);

      checkPageBreak(rowH + 2);

      doc.setFillColor(22, 30, 46);
      doc.setDrawColor(30, 41, 59);
      doc.roundedRect(margin, currentY, contentWidth, rowH, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`${idx + 1}. ${kf.label}`, margin + 5, currentY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(248, 250, 252);
      doc.text(valLines, margin + 52, currentY + 5.5);

      currentY += rowH + 2.5;
    });

    currentY += 6;

    // -------------------------------------------------------------
    // SECTION: SEARCH DETAILS (SEARCH QUERIES)
    // -------------------------------------------------------------
    const queries = Array.isArray(data.search_queries) ? data.search_queries : [];
    if (queries.length > 0) {
      checkPageBreak(25);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(56, 189, 248);
      doc.text('INVESTIGATION SCOPE', margin, currentY);
      currentY += 5;

      doc.setFontSize(13);
      doc.setTextColor(248, 250, 252);
      doc.text('Search Queries', margin, currentY);
      currentY += 6;

      queries.forEach((q, qIdx) => {
        checkPageBreak(8);
        doc.setFillColor(17, 24, 39);
        doc.setDrawColor(41, 53, 72);
        doc.roundedRect(margin, currentY, contentWidth, 7, 1, 1, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(203, 213, 225);
        doc.text(`${qIdx + 1}. ${sanitizeText(q)}`, margin + 5, currentY + 4.8);
        currentY += 8.5;
      });

      currentY += 4;
    }

    // -------------------------------------------------------------
    // SECTION: SOURCE LINKS
    // -------------------------------------------------------------
    const sourceLinks = Array.isArray(data.source_links) ? data.source_links : [];
    checkPageBreak(25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(56, 189, 248);
    doc.text('VERIFIABLE CITATIONS', margin, currentY);
    currentY += 5;

    doc.setFontSize(13);
    doc.setTextColor(248, 250, 252);
    doc.text('Source Links', margin, currentY);
    currentY += 6;

    if (sourceLinks.length === 0) {
      checkPageBreak(12);
      doc.setFillColor(17, 24, 39);
      doc.setDrawColor(41, 53, 72);
      doc.roundedRect(margin, currentY, contentWidth, 9, 1, 1, 'FD');

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text('No source links returned.', margin + 5, currentY + 6);
      currentY += 13;
    } else {
      sourceLinks.forEach((link, lIdx) => {
        checkPageBreak(9);
        doc.setFillColor(17, 24, 39);
        doc.setDrawColor(41, 53, 72);
        doc.roundedRect(margin, currentY, contentWidth, 8, 1, 1, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(56, 189, 248);

        const maxChars = 90;
        const displayUrl = link.length > maxChars ? link.slice(0, maxChars) + '...' : link;
        try {
          doc.textWithLink(`${lIdx + 1}. ${displayUrl}`, margin + 5, currentY + 5.2, { url: link });
        } catch (_) {
          doc.text(`${lIdx + 1}. ${displayUrl}`, margin + 5, currentY + 5.2);
        }
        currentY += 9.5;
      });
      currentY += 4;
    }

    // -------------------------------------------------------------
    // DISCLAIMER
    // -------------------------------------------------------------
    checkPageBreak(18);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const disclaimerText = 'Findings are based on the sources returned during this investigation. Absence of evidence does not establish absence of activity.';
    const disLines = doc.splitTextToSize(disclaimerText, contentWidth);
    doc.text(disLines, margin, currentY + 4);

    // -------------------------------------------------------------
    // FOOTER ON ALL PAGES
    // -------------------------------------------------------------
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      doc.setDrawColor(30, 41, 59);
      doc.setLineWidth(0.3);
      doc.line(margin, 286, pageWidth - margin, 286);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('BrandGuard360  —  Evidence-based brand search investigation', margin, 291);

      const pageStr = `Page ${i} of ${totalPages}`;
      doc.text(pageStr, pageWidth - margin - doc.getTextWidth(pageStr), 291);
    }

    return doc;
  }

  // Export Report Secondary CTA -> Professional PDF Generation
  if (btnExportReport) {
    btnExportReport.addEventListener('click', async () => {
      if (!currentInvestigation) {
        alert('No investigation available to export.');
        return;
      }

      // Temporary loading state
      const originalHTML = btnExportReport.innerHTML;
      btnExportReport.disabled = true;
      btnExportReport.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10"/>
        </svg>
        <span>Generating PDF...</span>
      `;

      try {
        // Yield momentarily to allow DOM render of loading state
        await new Promise(resolve => setTimeout(resolve, 60));

        const doc = generateInvestigationPDF(currentInvestigation);

        // Sanitize filename: BrandGuard360_<company>_<location>.pdf
        const safeBrand = (currentInvestigation.brand || currentInvestigation.company_name || 'brand')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');
        const safeLocation = (currentInvestigation.location || currentInvestigation.investigation_location || 'location')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '');

        const filename = `BrandGuard360_${safeBrand}_${safeLocation}.pdf`;
        doc.save(filename);

      } catch (err) {
        console.error('[BrandGuard360] PDF Export Error:', err);
        alert('PDF export failed. Please try again.');
      } finally {
        btnExportReport.disabled = false;
        btnExportReport.innerHTML = originalHTML;
      }
    });
  }

  // Helper function to escape HTML
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initial State: Render initial truthful session reports state (empty)
  renderReportsTable();

});
