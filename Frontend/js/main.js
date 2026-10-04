/**
 * BrandGuard360 — Internal Application Controller
 * Handles Screen 1 (Home), Screen 2 (Loading), Screens 3-7 (Overview, Search, Maps, News, Reports)
 * 
 * Rules:
 * - Evidence-first investigation workflow: Search -> Maps -> News -> Dossier Report
 * - Zero numeric scores anywhere
 * - Zero bullet character anywhere (no bullet character)
 * - Muted neutral terminology (no speculative wrongdoing accusations)
 */

document.addEventListener('DOMContentLoaded', () => {

  // Current Active State
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

  // Helper: set field error
  const setFieldError = (inputEl, errorEl, message) => {
    const wrapper = inputEl.closest('.input-wrapper');
    if (message) {
      wrapper.classList.add('error');
      errorEl.textContent = message;
    } else {
      wrapper.classList.remove('error');
      errorEl.textContent = '';
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
    input.addEventListener('input', () => {
      const errorEl = input === inputBrand ? brandError : (input === inputLocation ? locationError : websiteError);
      setFieldError(input, errorEl, '');
    });
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
      reportSegmentedBar.style.display = 'block';
    } else {
      reportSegmentedBar.style.display = 'none';
    }

    // Scroll main content to top
    document.getElementById('shellMainContent').scrollTop = 0;
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
        document.getElementById('investigate-card').scrollIntoView({ behavior: 'smooth' });
        inputBrand.focus();
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Mobile Drawer Toggle
  function openMobileDrawer() {
    shellSidebar.classList.add('mobile-open');
    sidebarBackdrop.classList.add('visible');
    sidebarBackdrop.setAttribute('aria-hidden', 'false');
  }

  function closeMobileDrawer() {
    shellSidebar.classList.remove('mobile-open');
    sidebarBackdrop.classList.remove('visible');
    sidebarBackdrop.setAttribute('aria-hidden', 'true');
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
        loadAndRenderReports();
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

  // Helper to switch top nav active link and underline indicator
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
      document.getElementById('investigate-card').scrollIntoView({ behavior: 'smooth' });
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

  // Scroll spy to transfer underline when scrolling between sections
  window.addEventListener('scroll', () => {
    if (homePageWrapper.style.display === 'none') return;
    const howSection = document.getElementById('how-it-works');
    if (!howSection) return;
    const rect = howSection.getBoundingClientRect();
    if (rect.top <= 140 && rect.bottom >= 140) {
      setActiveTopNav(navHowItWorks);
    } else if (window.scrollY < 300) {
      setActiveTopNav(navHome);
    }
  }, { passive: true });

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

  // Form Submit Handler -> Screen 2 Investigation Loading
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

    // Launch Screen 2: Investigation Loading Workflow
    await startInvestigationLoading(brandValue, locationValue, websiteValue);
  });

  // SCREEN 2: Investigation Loading Workflow Execution
  async function startInvestigationLoading(brand, location, website) {
    // Hide Home, show Loading View
    homePageWrapper.style.display = 'none';
    internalAppShell.style.display = 'none';
    viewLoading.style.display = 'flex';
    viewLoading.setAttribute('aria-hidden', 'false');
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Populate Loading Meta
    loadingBrandTarget.textContent = brand;
    loadingLocationTarget.textContent = location;

    // Reset stages
    stageStepSearch.className = 'stage-step active';
    stageStepMaps.className = 'stage-step';
    stageStepNews.className = 'stage-step';

    stagePillSearch.textContent = 'Analyzing';
    stagePillMaps.textContent = 'Pending';
    stagePillNews.textContent = 'Pending';

    stageBarSearch.style.width = '45%';
    stageBarMaps.style.width = '0%';
    stageBarNews.style.width = '0%';

    stageMsgSearch.textContent = 'Querying Google Search index and organic placements...';
    stageMsgMaps.textContent = 'Queued: pending location-signal cross-check...';
    stageMsgNews.textContent = 'Queued: pending contextual editorial query...';

    readyBanner.style.display = 'none';

    // Fetch investigation data from clean mock data layer
    try {
      const invData = await window.BrandGuardData.getInvestigation(brand, location, website);
      currentInvestigation = invData;

      // Deterministic Progress Timing: Search -> Maps -> News
      // Step 1: Search finishes after 1100ms
      await new Promise(r => setTimeout(r, 1100));
      stageStepSearch.className = 'stage-step completed';
      stagePillSearch.textContent = 'Complete';
      stageBarSearch.style.width = '100%';
      stageMsgSearch.textContent = 'Organic presence and advertisement signals cataloged.';

      // Step 2: Maps begins
      stageStepMaps.className = 'stage-step active';
      stagePillMaps.textContent = 'Analyzing';
      stageBarMaps.style.width = '50%';
      stageMsgMaps.textContent = `Cross-referencing verified business markers in ${location}...`;

      // Step 2: Maps finishes after 1100ms
      await new Promise(r => setTimeout(r, 1100));
      stageStepMaps.className = 'stage-step completed';
      stagePillMaps.textContent = 'Complete';
      stageBarMaps.style.width = '100%';
      stageMsgMaps.textContent = 'Physical presence and naming similarities mapped.';

      // Step 3: News begins
      stageStepNews.className = 'stage-step active';
      stagePillNews.textContent = 'Analyzing';
      stageBarNews.style.width = '60%';
      stageMsgNews.textContent = `Gathering recent editorial coverage and context for ${brand}...`;

      // Step 3: News finishes after 1100ms
      await new Promise(r => setTimeout(r, 1100));
      stageStepNews.className = 'stage-step completed';
      stagePillNews.textContent = 'Complete';
      stageBarNews.style.width = '100%';
      stageMsgNews.textContent = 'Contextual coverage collected with inspectable citations.';

      // Stage Completed -> Show Ready Banner
      readyBanner.style.display = 'flex';

      // Setup click on "View Findings" button
      btnViewFindings.onclick = () => {
        renderInvestigationDossier(currentInvestigation);
        navigateToView('overview');
      };

    } catch (err) {
      console.error('Investigation loading error:', err);
      viewLoading.style.display = 'none';
      internalAppShell.style.display = 'flex';
      navigateToView('error');
    }
  }

  // RENDER COMPLETE INVESTIGATION DOSSIER (Screens 3 to 6)
  function renderInvestigationDossier(data) {
    if (!data) return;

    // Header Metadata
    headerBrandBadge.textContent = data.brand;
    headerLocationTag.textContent = data.location;
    if (data.website) {
      headerWebsiteLink.style.display = 'inline-flex';
      headerWebsiteLink.href = data.website.startsWith('http') ? data.website : `https://${data.website}`;
      headerWebsiteText.textContent = data.website.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    } else {
      headerWebsiteLink.style.display = 'none';
    }

    // Counts on Sidebar and Subnav
    const organicCount = (data.web_search_report && data.web_search_report.organic_results) ? data.web_search_report.organic_results.length : 0;
    const mapsCount = (data.maps_findings && data.maps_findings.listings) ? data.maps_findings.listings.length : 0;
    const newsCount = (data.news_findings && data.news_findings.articles) ? data.news_findings.articles.length : 0;

    sideBadgeSearch.textContent = organicCount;
    sideBadgeMaps.textContent = mapsCount;
    sideBadgeNews.textContent = newsCount;
    segCountSearch.textContent = organicCount;
    segCountMaps.textContent = mapsCount;
    segCountNews.textContent = newsCount;

    // -------------------------------------------------------------
    // SCREEN 3: INVESTIGATION OVERVIEW
    // -------------------------------------------------------------
    ovBrandName.textContent = data.brand;
    ovLocation.textContent = data.location;
    if (data.website) {
      ovWebsite.textContent = data.website;
      ovWebsiteLink.href = data.website.startsWith('http') ? data.website : `https://${data.website}`;
    } else {
      ovWebsite.textContent = 'Not Provided';
      ovWebsiteLink.removeAttribute('href');
    }

    // Overall Brand Signal (CONFIRMED / CONFLICTING / UNKNOWN)
    ovOverallSignalBadge.textContent = data.overall_signal;
    ovOverallSignalBadge.className = 'signal-status-pill';
    if (data.overall_signal === 'CONFIRMED') {
      ovOverallSignalBadge.classList.add('signal-confirmed');
    } else if (data.overall_signal === 'CONFLICTING') {
      ovOverallSignalBadge.classList.add('signal-conflicting');
    } else {
      ovOverallSignalBadge.classList.add('signal-unknown');
    }
    ovOverallSignalExplanation.textContent = data.explanation;

    // Source Summaries
    if (data.sources_summary) {
      ovSearchSignal.textContent = data.sources_summary.search.signal;
      ovSearchSignal.className = `status-pill status-${data.sources_summary.search.signal.toLowerCase()}`;
      ovSearchExplanation.textContent = data.sources_summary.search.summary;

      ovMapsSignal.textContent = data.sources_summary.maps.signal;
      ovMapsSignal.className = `status-pill status-${data.sources_summary.maps.signal.toLowerCase()}`;
      ovMapsExplanation.textContent = data.sources_summary.maps.summary;

      ovNewsSignal.textContent = data.sources_summary.news.signal;
      ovNewsSignal.className = `status-pill status-${data.sources_summary.news.signal.toLowerCase()}`;
      ovNewsExplanation.textContent = data.sources_summary.news.summary;
    }

    // Key Findings Grid
    ovKeyFindingsGrid.innerHTML = '';
    if (data.key_findings && data.key_findings.length > 0) {
      data.key_findings.forEach(kf => {
        const card = document.createElement('div');
        card.className = 'finding-card';
        card.innerHTML = `
          <div class="finding-card-header">
            <h3 class="finding-title">${escapeHtml(kf.title)}</h3>
            <span class="status-pill status-${(kf.status || 'positive').toLowerCase()}">${escapeHtml(kf.status)}</span>
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
    ovExecutiveSummaryText.textContent = data.executive_summary;

    // -------------------------------------------------------------
    // SCREEN 4: GOOGLE SEARCH
    // -------------------------------------------------------------
    const searchReport = data.web_search_report || {};
    searchSourceSignalBadge.textContent = searchReport.signal || 'Positive';
    searchSourceSignalBadge.className = `status-pill status-${(searchReport.signal || 'positive').toLowerCase()}`;

    // Owner Website panel
    searchOwnerStatusPill.textContent = searchReport.owner_website_status || 'Found';
    searchOwnerStatusPill.className = `status-pill status-${(searchReport.owner_website_status === 'Found' ? 'positive' : 'warning')}`;
    searchOwnerDomain.textContent = searchReport.owner_domain || (data.website ? data.website.replace(/^https?:\/\//, '') : 'Not Provided');
    searchOwnerPosition.textContent = searchReport.owner_position ? `Position #${searchReport.owner_position}` : 'Position Not Listed';
    searchOwnerExplanation.textContent = searchReport.explanation || 'Owner domain identified in organic placements.';

    // Organic Results
    searchOrganicContainer.innerHTML = '';
    if (searchReport.organic_results && searchReport.organic_results.length > 0) {
      searchReport.organic_results.forEach(item => {
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
              <span class="status-pill status-${(item.signal || 'positive').toLowerCase()}">${escapeHtml(item.signal || 'Positive')}</span>
            </div>
            <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="result-title-link">
              ${escapeHtml(item.title)}
            </a>
            <p class="result-snippet">${escapeHtml(item.snippet)}</p>
            <div class="result-footer-row">
              <span class="finding-source-tag">Google Search Placement</span>
              <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" class="btn-view-source">
                <span>View Source</span>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        `;
        searchOrganicContainer.appendChild(row);
      });
    } else {
      searchOrganicContainer.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-state-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 class="empty-state-title">No Organic Results Found</h3>
          <p class="empty-state-text">No public organic search results were returned for this query.</p>
        </div>
      `;
    }

    // Advertisements
    searchAdsContainer.innerHTML = '';
    if (searchReport.advertisements && searchReport.advertisements.length > 0) {
      searchReport.advertisements.forEach(ad => {
        const adCard = document.createElement('div');
        adCard.className = 'ad-card-item';
        adCard.innerHTML = `
          <div class="ad-top-row">
            <div class="ad-identity">
              <span class="ad-sponsor-label">SPONSORED</span>
              <span class="ad-advertiser-name">${escapeHtml(ad.advertiser)}</span>
              <span class="ad-domain-text">${escapeHtml(ad.domain)}</span>
            </div>
            <span class="status-pill status-${(ad.signal === 'Review Needed' ? 'concerning' : 'warning')}">${escapeHtml(ad.signal)}</span>
          </div>
          <p class="ad-copy-text">${escapeHtml(ad.text)}</p>
          <div class="result-footer-row">
            <span class="finding-source-tag">Google Sponsored Ads</span>
            <a href="${escapeHtml(ad.url)}" target="_blank" rel="noopener noreferrer" class="btn-view-source">
              <span>View Source</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        `;
        searchAdsContainer.appendChild(adCard);
      });
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

    // Mentioned Brands
    searchMentionedBrandsCluster.innerHTML = '';
    const mentioned = searchReport.mentioned_brands || [data.brand];
    mentioned.forEach(name => {
      const chip = document.createElement('span');
      chip.className = 'neutral-tag-chip';
      chip.textContent = name;
      searchMentionedBrandsCluster.appendChild(chip);
    });

    // Potential Competitors
    searchPotentialCompetitorsList.innerHTML = '';
    const competitors = searchReport.potential_competitors || [];
    if (competitors.length > 0) {
      competitors.forEach(comp => {
        const item = document.createElement('div');
        item.className = 'competitor-item-card';
        item.innerHTML = `
          <div class="comp-header">
            <span class="comp-name">${escapeHtml(comp.name)}</span>
            <span class="comp-domain">${escapeHtml(comp.domain || '')}</span>
          </div>
          <p class="comp-note">${escapeHtml(comp.note || 'Contextual presence in industry listings.')}</p>
        `;
        searchPotentialCompetitorsList.appendChild(item);
      });
    } else {
      searchPotentialCompetitorsList.innerHTML = `
        <p class="neutral-box-desc" style="margin-bottom: 0;">No potential competitors with relevant evidence identified for this query.</p>
      `;
    }

    // -------------------------------------------------------------
    // SCREEN 5: GOOGLE MAPS
    // -------------------------------------------------------------
    const mapsFindings = data.maps_findings || {};
    mapsSourceSignalBadge.textContent = mapsFindings.signal || 'Positive';
    mapsSourceSignalBadge.className = `status-pill status-${(mapsFindings.signal || 'positive').toLowerCase()}`;
    mapsFindingsSummary.textContent = mapsFindings.summary || 'Relevant nearby listings were found.';
    mapsCoordTag.textContent = data.location;
    mapTargetMarketText.textContent = `${data.brand} — ${data.location}`;

    // Listings Container & Lightweight Map Pins
    mapsListingsContainer.innerHTML = '';
    mapPinsLayer.innerHTML = '';

    const listings = mapsFindings.listings || [];
    mapsListingCount.textContent = `${listings.length} listings`;

    if (listings.length > 0) {
      listings.forEach((listing, index) => {
        const signalClass = listing.naming_signal === 'Normal' ? 'normal' : (listing.naming_signal === 'Similar Naming' ? 'similar' : 'review');

        // Listing Card
        const card = document.createElement('div');
        card.className = 'map-listing-card';
        card.id = `listingCard-${listing.id || index}`;
        card.innerHTML = `
          <div class="listing-top-row">
            <h4 class="listing-name">${escapeHtml(listing.name)}</h4>
            <span class="naming-signal-tag ${signalClass}">${escapeHtml(listing.naming_signal)}</span>
          </div>
          <div class="listing-category-text">${escapeHtml(listing.category)}</div>
          <div class="listing-address-row">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${escapeHtml(listing.location)}</span>
          </div>
          <div class="listing-bottom-row">
            <div class="rating-score-group">
              <span class="star-rating">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${escapeHtml(listing.rating)}
              </span>
              <span class="review-count-text">(${listing.review_count} reviews)</span>
            </div>
            <a href="${escapeHtml(listing.url)}" target="_blank" rel="noopener noreferrer" class="btn-view-source">
              <span>View Source</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          </div>
        `;
        mapsListingsContainer.appendChild(card);

        // Map Marker Pin
        const coordX = listing.coordinates ? listing.coordinates.x : (35 + index * 20);
        const coordY = listing.coordinates ? listing.coordinates.y : (40 + index * 18);
        const pin = document.createElement('div');
        pin.className = `map-marker-pin ${signalClass}`;
        pin.style.left = `${coordX}%`;
        pin.style.top = `${coordY}%`;
        pin.innerHTML = `
          <div class="marker-point"></div>
          <div class="marker-tooltip">${escapeHtml(listing.name)}</div>
        `;

        // Click on pin highlights listing card
        pin.addEventListener('click', () => {
          document.querySelectorAll('.map-listing-card').forEach(c => c.classList.remove('highlighted'));
          card.classList.add('highlighted');
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

        // Hover on listing card highlights pin
        card.addEventListener('mouseenter', () => {
          pin.style.transform = 'translate(-50%, -60%) scale(1.2)';
        });
        card.addEventListener('mouseleave', () => {
          pin.style.transform = 'translate(-50%, -50%)';
        });

        mapPinsLayer.appendChild(pin);
      });
    } else {
      // Empty state for Google Maps
      mapsListingsContainer.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-state-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <h3 class="empty-state-title">No Maps Listings</h3>
          <p class="empty-state-text">No relevant Maps listings were returned for this brand in the investigated location.</p>
        </div>
      `;
    }

    // -------------------------------------------------------------
    // SCREEN 6: GOOGLE NEWS
    // -------------------------------------------------------------
    const newsFindings = data.news_findings || {};
    newsSourceSignalBadge.textContent = newsFindings.signal || 'Positive';
    newsSourceSignalBadge.className = `status-pill status-${(newsFindings.signal || 'positive').toLowerCase()}`;
    newsFindingsSummary.textContent = newsFindings.summary || 'Recent editorial coverage focuses on corporate expansion.';

    newsArticlesContainer.innerHTML = '';
    const articles = newsFindings.articles || [];
    if (articles.length > 0) {
      articles.forEach(article => {
        const artCard = document.createElement('div');
        artCard.className = 'news-article-card';
        artCard.innerHTML = `
          <div class="article-top-meta">
            <div class="article-pub-row">
              <span class="article-publisher">${escapeHtml(article.publisher)}</span>
              <span class="meta-sep">,</span>
              <span class="article-date">${escapeHtml(article.date)}</span>
            </div>
            <span class="status-pill status-positive">${escapeHtml(article.relevance || 'Brand Coverage')}</span>
          </div>
          <h3 class="article-headline">
            <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.headline)}</a>
          </h3>
          <p class="article-summary-text">${escapeHtml(article.summary)}</p>
          <div class="article-bottom-row">
            <span class="finding-source-tag">Google News Editorial</span>
            <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer" class="btn-view-source">
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
          <h3 class="empty-state-title">No Relevant News</h3>
          <p class="empty-state-text">No relevant news coverage was found for this investigation.</p>
        </div>
      `;
    }
  }

  // -------------------------------------------------------------
  // SCREEN 7: REPORTS LISTING & SEARCH FILTERING
  // -------------------------------------------------------------
  async function loadAndRenderReports() {
    allReportsList = await window.BrandGuardData.getReports();
    renderReportsTable();
  }

  function renderReportsTable() {
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
          <div class="empty-state-title" style="margin-bottom: 4px;">No Matching Investigations</div>
          <div class="empty-state-text">No previous brand reports match your filter criteria.</div>
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

      // Click to open previous investigation
      const viewBtn = tr.querySelector('.btn-table-view');
      viewBtn.addEventListener('click', async () => {
        const inv = await window.BrandGuardData.getInvestigationById(rep.id);
        currentInvestigation = inv;
        renderInvestigationDossier(currentInvestigation);
        navigateToView('overview');
      });

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

  // Export Report Secondary CTA
  if (btnExportReport) {
    btnExportReport.addEventListener('click', () => {
      if (!currentInvestigation) return;
      const jsonStr = JSON.stringify(currentInvestigation, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brandguard360-${currentInvestigation.brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}-dossier.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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

  // Initial setup: Load default Makeprd investigation into memory
  window.BrandGuardData.getInvestigation('Makeprd', 'Chennai, Tamil Nadu', 'https://makeprd.com').then(data => {
    currentInvestigation = data;
    loadAndRenderReports();
  });

});
