const puppeteer = require('puppeteer');
const {imgResize} = require('./utils');

/**
 * get page data from url by puppeteer
 * @param {puppeteer.Page} page puppeteer page object
 * @param {string} url the url to be fetched
 * @param {object} options options
 * @returns screenshot image in base64
 */
const getPageScreenshot = async (page, url, options) => {
    try {
        await page.goto(url, {timeout: options.timeout});

        const screenshot = await page.screenshot();
        const img = await imgResize(screenshot, 400, options.screenshotQuality);

        return img.toString('base64');
    } catch (e) {
        console.log(`link-beautify: Unable to get screenshot from ${url}`);
        return '';
    }
};

/**
 * build html string from page data
 * @param {object} node link node
 * @param {string} screenshot image in base64
 * @returns html string
 */
const getHTML = (node, screenshot) => {
    const {url, children} = node;

    return `
    <span class="link-preview-container">
        <a target="_blank" rel="noopener noreferrer" href="${url}">
            ${children[0].value}
        </a>
        ${screenshot && `<img src="data:image/webp;base64,${screenshot}" />`}
    </span>`.trim();
};

module.exports = {
    getPageScreenshot,
    getHTML,
};
