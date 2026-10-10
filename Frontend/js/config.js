/**
 * BrandGuard360 — Frontend Runtime API Configuration
 * 
 * Automatically detects whether the application is running in local development
 * or in production (e.g. deployed on Vercel), and configures window.BRANDGUARD_API_URL.
 * 
 * - Local development: http://localhost:8000
 * - Deployed production: https://brandguard360-backend.onrender.com
 * 
 * Loads before main.js executes to preserve the window.BRANDGUARD_API_URL contract.
 */
(function () {
  'use strict';

  // If already set explicitly (e.g., via test runner or preceding script), retain it
  if (window.BRANDGUARD_API_URL) {
    return;
  }

  var hostname = (window.location && window.location.hostname) || '';
  var protocol = (window.location && window.location.protocol) || '';

  // Identify local development environments
  var isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === '' ||
    protocol === 'file:';

  // Configure appropriate backend API base URL
  var apiUrl = isLocal
    ? 'http://localhost:8000'
    : 'https://brandguard360-backend.onrender.com';

  window.BRANDGUARD_API_URL = apiUrl;

  console.log(
    '[BrandGuard360] Runtime API configured: ' +
    apiUrl +
    ' (Environment: ' + (isLocal ? 'Local Development' : 'Deployed Production') + ')'
  );
})();
