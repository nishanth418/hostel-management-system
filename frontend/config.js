// frontend/config.js
// Configuration for backend API URL.
// In local development or unified deployment, keep API_BASE_URL as "" (empty string) to use relative URLs.
// When the backend is deployed separately (e.g. on Render) and frontend on Vercel,
// set API_BASE_URL to your Render backend URL, e.g.: "https://your-backend.onrender.com"
window.API_BASE_URL = window.API_BASE_URL || "";

// Intercept fetch calls to prepend API_BASE_URL for all /api/ endpoints
(function () {
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
        if (typeof input === "string" && input.startsWith("/api/") && window.API_BASE_URL) {
            input = window.API_BASE_URL.replace(/\/+$/, "") + input;
        }
        return originalFetch(input, init);
    };
})();
