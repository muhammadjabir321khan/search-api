module.exports = {
    PORT: process.env.PORT || 3000,
    PUPPETEER_CONFIG: {
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ],
        ignoreHTTPSErrors: true,
        defaultViewport: {
            width: 1280,
            height: 800
        }
    },
    SEARCH_RESULTS_LIMIT: 10
}; 