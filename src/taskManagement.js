const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const EventEmitter = require('events').EventEmitter;

const {getHTML: getCardHTML, getPageData} = require('./linkCard');
const {getHTML: getPreviewHTML, getPageScreenshot} = require('./linkPreview');

const {isLinkCard} = require('./utils');

const emitter = new EventEmitter();
const PAGE_NUMBER_PER_BROWSER = 5;

/**
 * Initialize puppeteer and add websocket endpoint to WSE_LIST
 * @param {object} options plugin options
 * @returns {Promise} If browser is ready, return immediately otherwise wait for it
 */
const init = async (options) => {
    // create linkBeautify cache folder
    const p = path.resolve(process.cwd(), '.cache', 'linkBeautify');
    if (!fs.existsSync(p)) {
        fs.mkdirSync(p);
    }
    const {browserNumer: num, puppeteerLaunchArgs: args} = options;
    if (global.WSE_LIST) {
        if (global.WSE_LIST.length >= num) {
            return;
        } else {
            return new Promise((resolve) => {
                emitter.once('linkBeautifyInit', resolve);
            });
        }
    }
    global.WSE_LIST = [];
    global.PUPPETEER_PAGE_NUMBER = 0;  // Current page count
    global.LINK_BEAUTIFY_LISTENER = 0; // Listener number
    global.LINK_BEAUTIFY_CALLER = 0; // Emitter number
    global.LINK_BEAUTIFY_PVIMG_PROCESSING = new Set(); // Processing images set
    global.LINK_BEAUTIFY_PVIMG_FINISHED = new Set(); // Finished images set
    while (WSE_LIST.length < num) {
        const browser = await puppeteer.launch({args});
        WSE_LIST.push(browser.wsEndpoint());
    }
    emitter.emit('linkBeautifyInit');
};

/**
 * Close all browser if there are no task running
 */
const close = async () => {
    // If there are no more taskgroups running, reset global variables
    if (PUPPETEER_PAGE_NUMBER === 0) {
        LINK_BEAUTIFY_LISTENER = 0;
        LINK_BEAUTIFY_CALLER = 0;
        // Do not close the browser if in development mode
        if (process.env.NODE_ENV !== 'development') {
            while (WSE_LIST.length) {
                const browserWSEndpoint = WSE_LIST.pop();
                const browser = await puppeteer.connect({browserWSEndpoint});
                await browser.close();
            }
        }
    }
};

/**
 * If there are free tabs return immediately otherwise wait for it
 * @param {number} tasksNum number of tasks
 */
const free = (tasksNum) => {
    // Small taskgroups will run immediately
    // If there are free tabs, run immediately
    if (
        tasksNum < 3 ||
        PUPPETEER_PAGE_NUMBER < PAGE_NUMBER_PER_BROWSER * WSE_LIST.length
    ) {
        return;
    }
    // Other taskgroups will wait for free tabs
    return new Promise((resolve) => {
        emitter.once(`linkBeautifyFree-${++LINK_BEAUTIFY_LISTENER}`, resolve);
    });
};

/**
 * Create a new page
 * @param {puppeteer.Browser} browser puppeteer browser
 */
const newPage = (browser) => {
    PUPPETEER_PAGE_NUMBER++;
    return browser.newPage();
};

/**
 * Close page
 * @param {puppeteer.Page} page puppeteer page
 */
const closePage = (page) => {
    // If there are free spaces && there are taskgroups waitting, run the next task
    if (
        PAGE_NUMBER_PER_BROWSER * WSE_LIST.length > --PUPPETEER_PAGE_NUMBER &&
        LINK_BEAUTIFY_LISTENER > LINK_BEAUTIFY_CALLER
    ) {
        emitter.emit(`linkBeautifyFree-${++LINK_BEAUTIFY_CALLER}`);
    }
    return page.close();
};

/**
 * Task to get page data and build html string
 * @param {object} data task data
 * @param {object} options plugin options
 */
const task = async (data, options) => {
    const browserWSEndpoint =
        WSE_LIST[Math.floor(Math.random() * WSE_LIST.length)];
    const browser = await puppeteer.connect({browserWSEndpoint});

    const {node, url, cache} = data;
    let html;

    if (isLinkCard(node, options.delimiter)) {
        // If there are data in cache, return it
        html = await cache.get(`linkCard-${url}`);
        if (!html) {
            const page = await newPage(browser);
            const meta = await getPageData(page, data, options);
            html = getCardHTML(meta, options.showFavicon);
            if (meta.success) {
                await cache.set(`linkCard-${url}`, html);
            }
            await closePage(page);
        }
    } else {
        // Do not use cache object as images are stored in cache files
        const page = await newPage(browser);
        const screenshot = await getPageScreenshot(page, data, options);
        await closePage(page);
        html = await getPreviewHTML(
            data,
            screenshot,
            options.screenshotQuality,
        );
    }

    node.type = 'html';
    node.value = html;
    node.children = undefined;
};

module.exports = {init, close, free, task};
