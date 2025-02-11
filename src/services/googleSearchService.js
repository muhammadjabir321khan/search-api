const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
const config = require('../config/config');

// Configure StealthPlugin
const stealthPlugin = StealthPlugin();
puppeteerExtra.use(stealthPlugin);
puppeteerExtra.use(AdblockerPlugin({ blockTrackers: true }));

class GoogleSearchService {
    async search(query) {
        let browser;
        try {
            browser = await puppeteerExtra.launch({
                headless: false,  // Show browser for manual captcha solving
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-infobars',
                    '--disable-automation',
                    '--disable-blink-features=AutomationControlled',
                    '--window-size=1920,1080',
                ],
                ignoreDefaultArgs: ['--enable-automation']
            });

            const page = await browser.newPage();
            
            // Set a realistic viewport
            await page.setViewport({ 
                width: 1920, 
                height: 1080,
                deviceScaleFactor: 1,
            });

            // Set a realistic user agent
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // Add human-like behaviors
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
                Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            });

            console.log('Navigating to Google...');
            await page.goto('https://www.google.com');
            await this.randomDelay(1000, 2000);

            // Handle cookie consent
            try {
                const consentButton = await page.$('button[aria-label="Accept all"]');
                if (consentButton) {
                    await this.humanClick(page, consentButton);
                    await this.randomDelay(1000, 2000);
                }
            } catch (error) {
                console.log('No cookie banner found');
            }

            // Type the search query with human-like behavior
            console.log('Typing search query:', query);
            await this.humanType(page, 'textarea[name="q"]', query);
            await this.randomDelay(500, 1000);

            // Click search or press enter
            const searchButton = await page.$('input[name="btnK"]');
            if (searchButton) {
                await this.humanClick(page, searchButton);
            } else {
                await page.keyboard.press('Enter');
            }

            // Wait for results with a realistic delay
            await this.randomDelay(2000, 3000);

            // Check for captcha and wait for manual solving
            const isCaptchaPresent = await page.$('iframe[src*="recaptcha"]') !== null;
            if (isCaptchaPresent) {
                console.log('Captcha detected! Please solve it manually...');
                // Wait for the search results to appear after captcha is solved
                await page.waitForSelector('h3', { timeout: 0 }); // No timeout
            }

            // Extract results
            const results = await page.evaluate(() => {
                const searchResults = [];
                const headings = document.querySelectorAll('h3');
                
                for (const heading of headings) {
                    const link = heading.closest('a');
                    if (link && heading.textContent) {
                        searchResults.push({
                            title: heading.textContent.trim(),
                            link: link.href
                        });
                    }
                }

                return searchResults.slice(0, 10);
            });

            console.log(`Found ${results.length} results`);
            console.log('\nSearch Results:');
            console.log('==============');
            results.forEach((result, index) => {
                console.log(`\n${index + 1}. Title: ${result.title}`);
                console.log(`   Link: ${result.link}`);
            });
            console.log('\n==============\n');
            
            // Close browser only if no captcha was present
            if (!isCaptchaPresent) {
                await browser.close();
            }
            
            return results;

        } catch (error) {
            console.error('Search error:', error);
            // Don't close the browser on error if it's a timeout
            if (!error.message.includes('timeout') && browser) {
                await browser.close().catch(console.error);
            }
            throw new Error(`Failed to perform Google search: ${error.message}`);
        }
    }

    // Helper method for random delays
    async randomDelay(min, max) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Helper method for human-like typing
    async humanType(page, selector, text) {
        await page.waitForSelector(selector);
        const element = await page.$(selector);
        await element.click();
        
        for (let i = 0; i < text.length; i++) {
            await page.type(selector, text[i], {
                delay: Math.floor(Math.random() * 200) + 50
            });
        }
    }

    // Helper method for human-like clicking
    async humanClick(page, element) {
        const box = await element.boundingBox();
        const x = box.x + (box.width / 2) + (Math.random() * 10 - 5);
        const y = box.y + (box.height / 2) + (Math.random() * 10 - 5);
        
        await page.mouse.move(x, y, { steps: 10 });
        await this.randomDelay(100, 200);
        await page.mouse.click(x, y);
    }
}

module.exports = new GoogleSearchService(); 