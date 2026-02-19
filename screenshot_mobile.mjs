import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || 'mobile';

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
    }).catch(err => puppeteer.launch({ headless: "new" }));

    const page = await browser.newPage();
    // iPhone 12 Pro dimensions
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto(url, { waitUntil: 'networkidle0' });

    const dir = path.join(__dirname, 'temporary screenshots');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    // Find next screenshot number
    const files = fs.readdirSync(dir);
    let maxNum = 0;
    files.forEach(file => {
        const match = file.match(/^screenshot-(\d+)/);
        if (match) {
            const num = parseInt(match[1]);
            if (num > maxNum) maxNum = num;
        }
    });
    const nextNum = maxNum + 1;

    const filename = `screenshot-${nextNum}-${label}.png`;
    const filepath = path.join(dir, filename);

    await page.screenshot({ path: filepath, fullPage: true });

    console.log(`Screenshot saved to ${filepath}`);

    await browser.close();
})();
