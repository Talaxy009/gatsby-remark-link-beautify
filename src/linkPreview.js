const puppeteer = require('puppeteer');
const {fluid} = require('gatsby-plugin-sharp');
const EventEmitter = require('events').EventEmitter;

const {buildImg} = require('./utils');

const emitter = new EventEmitter();

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

    // Check if a screenshot with the same name has already been done
    if (global.LINK_BEAUTIFY_PVIMG_FINISHED.has(file.name)) {
        return file;
    }
    // Check if a screenshot with the same name is being processed
    if (global.LINK_BEAUTIFY_PVIMG_PROCESSING.has(file.name)) {
        return new Promise((resolve) => {
            emitter.once(`linkBeautifyDone-${file.name}`, () => {
                resolve(file);
            });
        });
    }
    global.LINK_BEAUTIFY_PVIMG_PROCESSING.add(file.name);

    try {
        await page.goto(url, {timeout: options.timeout, waitUntil: 'load'});
        await page.screenshot({path: file.absolutePath});

        // Move this screenshot to the FINISHED set and emit the event
        global.LINK_BEAUTIFY_PVIMG_FINISHED.add(file.name);
        global.LINK_BEAUTIFY_PVIMG_PROCESSING.delete(file.name);
        emitter.emit(`linkBeautifyDone-${file.name}`);

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
            args: {maxWidth: 800, srcSetBreakpoints: [800], quality},
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
