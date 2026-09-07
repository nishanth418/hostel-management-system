// frontend/config.js
// Configuration for backend API URL.
// When deployed (e.g. on Vercel), requests use the Render backend.
// In local development (localhost / 127.0.0.1 on port 3000), relative paths ("") use the local backend.

(function () {
    const RENDER_BACKEND_URL = "https://hostel-management-system-1lmi.onrender.com";

    // Detect if running in a local development environment
    const isLocalhost = Boolean(
        typeof window !== "undefined" &&
        window.location &&
        (window.location.hostname === "localhost" ||
         window.location.hostname === "127.0.0.1" ||
         window.location.hostname === "[::1]")
    );

    // Optional override via query parameter (e.g., ?backend=render or ?backend=local)
    const urlParams = (typeof window !== "undefined" && window.location && window.location.search)
        ? new URLSearchParams(window.location.search)
        : null;

    // Determine the active API_BASE_URL
    if (typeof window.API_BASE_URL === "undefined") {
        if (urlParams && urlParams.get("backend") === "render") {
            window.API_BASE_URL = RENDER_BACKEND_URL;
        } else if (urlParams && urlParams.get("backend") === "local") {
            window.API_BASE_URL = window.location.port === "3000" ? "" : "http://localhost:3000";
        } else if (isLocalhost) {
            // Local development: unified server on port 3000 uses relative URLs (""),
            // other ports (e.g. Live Server on port 5500) point to local backend
            window.API_BASE_URL = window.location.port === "3000" ? "" : "http://localhost:3000";
        } else {
            // Production deployment (e.g. Vercel, custom domain) or direct file preview
            window.API_BASE_URL = RENDER_BACKEND_URL;
        }
    }

    // Intercept fetch calls to route /api/ endpoints to the configured API_BASE_URL
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
        if (typeof input === "string") {
            if ((input.startsWith("/api/") || input === "/api") && window.API_BASE_URL) {
                const base = window.API_BASE_URL.replace(/\/+$/, "");
                input = base + input;
            }
        } else if (input instanceof Request && window.API_BASE_URL) {
            try {
                const url = new URL(input.url, window.location.href);
                if (url.pathname.startsWith("/api/") || url.pathname === "/api") {
                    const base = window.API_BASE_URL.replace(/\/+$/, "");
                    const newUrl = base + url.pathname + url.search;
                    input = new Request(newUrl, input);
                }
            } catch (e) {
                // Fallback to original request
            }
        } else if (typeof URL !== "undefined" && input instanceof URL && window.API_BASE_URL) {
            if (input.pathname.startsWith("/api/") || input.pathname === "/api") {
                const base = window.API_BASE_URL.replace(/\/+$/, "");
                input = new URL(base + input.pathname + input.search);
            }
        }
        return originalFetch(input, init);
    };
})();
