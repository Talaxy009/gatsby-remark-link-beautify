const puppeteer = require('puppeteer');
const {fluid} = require('gatsby-plugin-sharp');

const {buildImg} = require('./utils');

/**
 * get page data from url by puppeteer
 * @param {puppeteer.Page} page puppeteer page object
 * @param {string} url the url to be fetched
 * @param {object} options options
 * @returns image file obj
 */
const getPageScreenshot = async (page, data, options) => {
    const {url, reporter} = data;
    const file = buildImg(url);

    try {
        await page.goto(url, {timeout: options.timeout, waitUntil: 'load'});
        await page.screenshot({path: file.absolutePath});

        return file;
    } catch (e) {
        reporter.warn(`link-beautify: Unable to get screenshot from ${url}`);
        return null;
    }
};

/**
 * build html string from page data
 * @param {object} node link node
 * @param {string} file image path
 * @param {number} quality image quality
 * @returns html string
 */
const getHTML = async (data, file, quality) => {
    const {node, reporter, cache} = data;
    const linkHtml = `
    <a target="_blank" rel="noopener noreferrer" href="${node.url}">
        ${node.children[0].value}
    </a>`;

    if (!file) return linkHtml;

    try {
        const fluidResult = await fluid({
            file,
            args: {maxWidth: 800, srcSetBreakpoints: [400], quality},
            reporter,
            cache,
        });
        return `
        <span class="link-preview-container">
            ${linkHtml}
            ${
                fluidResult &&
                `
            <img
                src="${fluidResult.src}"
                srcset="${fluidResult.srcSet}"
                sizes="${fluidResult.sizes}"
                loading="lazy"
                decoding="async"
                style="background-image: url('${fluidResult.base64}'); background-size: cover;"
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
