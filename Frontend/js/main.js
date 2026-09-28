/**
 * BrandGuard360 — Screen 1: Landing Page & New Investigation
 * Client Interactivity & Evidence-Based Workflow Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const form = document.getElementById('investigationForm');
  const inputBrand = document.getElementById('inputBrandName');
  const inputLocation = document.getElementById('inputLocation');
  const inputWebsite = document.getElementById('inputWebsite');
  const btnSubmit = document.getElementById('btnInvestigateSubmit');
  
  const brandError = document.getElementById('brandError');
  const locationError = document.getElementById('locationError');
  const websiteError = document.getElementById('websiteError');
  
  const feedbackPanel = document.getElementById('investigationFeedbackPanel');
  const btnCloseFeedback = document.getElementById('btnCloseFeedback');
  const feedbackTargetBrand = document.getElementById('feedbackTargetBrand');
  const feedbackTargetLocation = document.getElementById('feedbackTargetLocation');
  const feedbackStatusText = document.getElementById('feedbackStatusText');
  
  const pipelineSearch = document.getElementById('pipelineSearch');
  const pipelineMaps = document.getElementById('pipelineMaps');
  const pipelineNews = document.getElementById('pipelineNews');
  const indicatorSearch = document.getElementById('indicatorSearch');
  const indicatorMaps = document.getElementById('indicatorMaps');
  const indicatorNews = document.getElementById('indicatorNews');
  const statusSearchMsg = document.getElementById('statusSearchMsg');
  const statusMapsMsg = document.getElementById('statusMapsMsg');
  const statusNewsMsg = document.getElementById('statusNewsMsg');

  const btnNavInvestigate = document.getElementById('btnNavInvestigate');

  // Input wrapper helper
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

  // Clear errors on input
  [inputBrand, inputLocation, inputWebsite].forEach(input => {
    input.addEventListener('input', () => {
      const errorEl = input === inputBrand ? brandError : (input === inputLocation ? locationError : websiteError);
      setFieldError(input, errorEl, '');
    });
  });

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

  // Nav "New Investigation" button: scroll and focus
  if (btnNavInvestigate) {
    btnNavInvestigate.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('investigate-card').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        inputBrand.focus();
      }, 400);
    });
  }

  // Close feedback panel
  if (btnCloseFeedback) {
    btnCloseFeedback.addEventListener('click', () => {
      feedbackPanel.classList.remove('visible');
      feedbackPanel.setAttribute('aria-hidden', 'true');
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
    });
  }

  // Form submission handler
  form.addEventListener('submit', (e) => {
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

    // Launch Evidence-based Investigation Sequence
    runInvestigationSequence(brandValue, locationValue, websiteValue);
  });

  function runInvestigationSequence(brand, location, website) {
    // Disable submit button & show loading state
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `
      <span class="btn-icon" aria-hidden="true">
        <svg class="spin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="btn-text">Investigating...</span>
    `;

    // Populate feedback target info
    feedbackTargetBrand.textContent = brand;
    feedbackTargetLocation.textContent = location;
    feedbackStatusText.textContent = 'CONNECTING TO SEARCH, MAPS & NEWS SOURCES';

    // Reset pipeline steps
    pipelineSearch.className = 'pipeline-step active';
    pipelineMaps.className = 'pipeline-step';
    pipelineNews.className = 'pipeline-step';

    statusSearchMsg.textContent = 'Querying Google Search index & organic placements...';
    statusMapsMsg.textContent = 'Queued: pending location-signal cross-check...';
    statusNewsMsg.textContent = 'Queued: pending press & editorial query...';

    indicatorSearch.textContent = 'Working';
    indicatorMaps.textContent = 'Pending';
    indicatorNews.textContent = 'Pending';

    // Show feedback drawer
    feedbackPanel.classList.add('visible');
    feedbackPanel.setAttribute('aria-hidden', 'false');
    feedbackPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Step 1: Search finishes after 1.2s
    setTimeout(() => {
      pipelineSearch.className = 'pipeline-step completed';
      indicatorSearch.innerHTML = '&#10003; 14 Results';
      statusSearchMsg.textContent = 'Organic presence and advertisement signals cataloged.';

      // Step 2: Maps begins
      pipelineMaps.className = 'pipeline-step active';
      indicatorMaps.textContent = 'Working';
      statusMapsMsg.textContent = `Cross-referencing verified business markers in ${location}...`;
      feedbackStatusText.textContent = 'EVALUATING GOOGLE MAPS SIGNALS';
    }, 1200);

    // Step 2: Maps finishes after 2.4s
    setTimeout(() => {
      pipelineMaps.className = 'pipeline-step completed';
      indicatorMaps.innerHTML = '&#10003; 3 Listings';
      statusMapsMsg.textContent = 'Physical presence & naming similarities mapped.';

      // Step 3: News begins
      pipelineNews.className = 'pipeline-step active';
      indicatorNews.textContent = 'Working';
      statusNewsMsg.textContent = `Gathering recent editorial coverage and mentions for ${brand}...`;
      feedbackStatusText.textContent = 'COLLECTING CONTEXTUAL NEWS COVERAGE';
    }, 2400);

    // Step 3: News finishes after 3.6s
    setTimeout(() => {
      pipelineNews.className = 'pipeline-step completed';
      indicatorNews.innerHTML = '&#10003; 6 Articles';
      statusNewsMsg.textContent = 'Contextual coverage collected with inspectable citations.';

      feedbackStatusText.textContent = 'INVESTIGATION EVIDENCE READY';

      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `
        <span class="btn-icon" aria-hidden="true">&#10003;</span>
        <span class="btn-text">Evidence Compiled &mdash; View Findings</span>
      `;
    }, 3600);
  }

  // Smooth scroll for nav links with active state update
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          navLinks.forEach(l => l.classList.remove('active'));
          this.classList.add('active');
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});
