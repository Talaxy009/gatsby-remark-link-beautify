const puppeteer = require('puppeteer');
const EventEmitter = require('events').EventEmitter;

const {getHTML: getCardHTML, getPageData} = require('./linkCard');
const {getHTML: getPreviewHTML, getPageScreenshot} = require('./linkPreview');

const {isLinkCard} = require('./utils');

const emitter = new EventEmitter();

/**
 * Initialize puppeteer and add websocket endpoint to WSE_LIST
 * @param {object} options plugin options
 * @returns {Promise} If browser is ready, return immediately otherwise wait for it
 */
const init = async (options) => {
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
    global.PUPPETEER_PAGE_NUMBER = 0;
    global.LINK_BEAUTIFY_LINSTER = 0;
    global.LINK_BEAUTIFY_CALLER = 1;
    for (let i = 0; i < num; i++) {
        const browser = await puppeteer.launch({
            headless: true,
            args,
        });
        WSE_LIST[i] = browser.wsEndpoint();
    }
    emitter.emit('linkBeautifyInit');
};

/**
 * Close all browser if there are no task running
 */
const close = async () => {
    // If there are no more taskgroups running, reset global variables
    if (PUPPETEER_PAGE_NUMBER === 0) {
        LINK_BEAUTIFY_LINSTER = 0;
        LINK_BEAUTIFY_CALLER = 1;
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
 * If there are free spaces return immediately otherwise wait for it
 * @param {number} tasksNum number of tasks
 * @returns
 */
const free = (tasksNum) => {
    // Small taskgroups will run immediately
    if (tasksNum < 3) {
        return;
    }
    // First taskgroup will run immediately
    // Other taskgroups will wait for the first one to finish
    if (LINK_BEAUTIFY_LINSTER++) {
        return new Promise((resolve) => {
            emitter.once(`linkBeautifyFree-${LINK_BEAUTIFY_LINSTER}`, resolve);
        });
    }
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
        3 * WSE_LIST.length > --PUPPETEER_PAGE_NUMBER &&
        LINK_BEAUTIFY_LINSTER > LINK_BEAUTIFY_CALLER
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
        html = await cache.get(`linkCard-${url}`);
        if (!html) {
            const page = await newPage(browser);
            const data = await getPageData(page, url, options);
            html = getCardHTML(data, options.showFavicon);
            await cache.set(`linkCard-${url}`, html);
            await closePage(page);
        }
    } else {
        html = await cache.get(`linkPreview-${url}`);
        if (!html) {
            const page = await newPage(browser);
            const screenshot = await getPageScreenshot(page, url, options);
            html = getPreviewHTML(node, screenshot);
            await cache.set(`linkPreview-${url}`, html);
            await closePage(page);
        }
    }

    node.type = 'html';
    node.value = html;
    node.children = undefined;
};

module.exports = {init, close, free, task};
