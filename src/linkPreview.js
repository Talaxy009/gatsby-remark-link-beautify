const puppeteer = require('puppeteer');
const {fixed} = require('gatsby-plugin-sharp');

/**
 * get page data from url by puppeteer
 * @param {puppeteer.Page} page puppeteer page object
 * @param {object} file file obj
 * @param {string} url the url to be fetched
 * @param {object} options options
 * @returns image file obj
 */
const getPageScreenshot = async (page, file, data, options) => {
    const {url, reporter} = data;

    try {
        await page.goto(url, {timeout: options.timeout, waitUntil: 'load'});
        await page.screenshot({path: file.absolutePath});

        return true;
    } catch (e) {
        reporter.warn(`link-beautify: Unable to get screenshot from ${url}`);
        return false;
    }
};

/**
 * build html string from page data
 * @param {object} node link node
 * @param {object} screenshot screenshot obj
 * @param {number} quality image quality
 * @returns html string
 */
const getHTML = async (data, screenshot, quality) => {
    const {node, reporter, cache} = data;
    const linkHtml = `
    <a target="_blank" rel="noopener noreferrer" href="${node.url}">
        ${node.children[0].value}
    </a>`;

    if (!screenshot.success) return linkHtml;

    try {
        const fixedResult = await fixed({
            file: screenshot.file,
            args: {width: 400, quality},
            reporter,
            cache,
        });
        return `
        <span class="link-preview-container">
            ${linkHtml}
            ${
                fixedResult &&
                `
            <img
                loading="lazy"
                decoding="async"
                alt="site preview image"
                src="${fixedResult.src}"
                srcset="${fixedResult.srcSet}"
                style="background-image: url('${fixedResult.base64}'); background-size: cover;"
            />
            `
            }
        </span>`.trim();
    } catch (error) {
        reporter.warn(error);
        return linkHtml;
    }
};

module.exports = {
    getPageScreenshot,
    getHTML,
};
