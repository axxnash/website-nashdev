import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" // Adjust if necessary, but try default first if this fails or just let puppeteer find it if installed via npm
    }).catch(err => {
        // Fallback to try and find chrome or just launch without executablePath if the above fails, 
        // but for this environment we might need to be specific if puppeteer isn't downloading chrome.
        // However, the rule says puppeteer is at C:/Users/nateh/AppData/Local/Temp/puppeteer-test/, which is weird.
        // I will assume standard puppeteer usage for now.
        return puppeteer.launch({ headless: "new" });
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
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

    const filename = `screenshot-${nextNum}${label ? '-' + label : ''}.png`;
    const filepath = path.join(dir, filename);

    await page.screenshot({ path: filepath, fullPage: true });

    console.log(`Screenshot saved to ${filepath}`);

    await browser.close();
})();
