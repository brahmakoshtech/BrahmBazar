import axios from 'axios';

const api = axios.create({
    // IMPORTANT:
    // The shop frontend must not call `store.brahmakosh.com` directly (CORS blocks).
    // Route all calls through our backend proxy instead.
    //
    // Proxy mount in Brahmakosh backend: `/api/store/*`
    // We rewrite all outgoing URLs that start with `/api/` into `/api/store/`.
    baseURL: process.env.NEXT_PUBLIC_API_PROXY_URL || 'https://prod.brahmakosh.com'
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const userInfo = localStorage.getItem('userInfo');
            if (userInfo) {
                const { token } = JSON.parse(userInfo);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        }

        // Ensure cookies can be included across subdomains (SSO cookie auth).
        // Note: axios uses XHR; without `withCredentials`, cookies may not be sent.
        config.withCredentials = true;

        // Rewrite `/api/*` -> `/api/store/*` so requests go through the backend proxy
        // (prevents CORS issues with store.brahmakosh.com).
        if (typeof config.url === 'string') {
            if (config.url.startsWith('/api/store/')) {
                // already rewritten
            } else if (config.url.startsWith('/api/')) {
                config.url = config.url.replace('/api/', '/api/store/');
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
