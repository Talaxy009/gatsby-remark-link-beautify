const puppeteer = require('puppeteer');
const uniqueSlug = require('unique-slug');
const EventEmitter = require('events').EventEmitter;

const {getHTML: getCardHTML, getPageData} = require('./linkCard');
const {getHTML: getPreviewHTML, getPageScreenshot} = require('./linkPreview');

const {isLinkCard, buildImg} = require('./utils');

const emitter = new EventEmitter();
const PAGE_NUMBER_PER_BROWSER = 5;

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
    global.PUPPETEER_PAGE_NUMBER = 0; // Current page count
    global.LINK_BEAUTIFY_LISTENER = 0; // Listener number
    global.LINK_BEAUTIFY_TASKS = []; // Waitting tasks array
    global.LINK_BEAUTIFY_IMG = new Map(); // Images' map
    global.LINK_BEAUTIFY_CARD = new Map(); // Cards' map
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
    const number = ++LINK_BEAUTIFY_LISTENER;
    LINK_BEAUTIFY_TASKS.push({no: number, size: tasksNum});
    return new Promise((resolve) => {
        emitter.once(`linkBeautifyFree-${number}`, resolve);
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
    let freeNum = PAGE_NUMBER_PER_BROWSER * WSE_LIST.length - --PUPPETEER_PAGE_NUMBER;
    while (freeNum > 0 && LINK_BEAUTIFY_TASKS.length > 0) {
        const task = LINK_BEAUTIFY_TASKS.shift();
        emitter.emit(`linkBeautifyFree-${task.no}`);
        freeNum -= task.size;
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

    const {node, url, createContentDigest} = data;
    const name = uniqueSlug(url);
    let html;

    if (isLinkCard(node, options.delimiter)) {
        let meta = null;

        // Check if a site with the same url is being processed
        if (!LINK_BEAUTIFY_CARD.has(name)) {
            LINK_BEAUTIFY_CARD.set(name, null);
            const page = await newPage(browser);
            meta = await getPageData(page, data, options);
            await closePage(page);

            // Store meta and emit the event
            LINK_BEAUTIFY_CARD.set(name, meta);
            emitter.emit(`linkCardDone-${name}`);
        // Check if a site with the same url has already been done
        } else if (!LINK_BEAUTIFY_CARD.get(name)) {
            meta = await new Promise((resolve) => {
                emitter.once(`linkCardDone-${name}`, () => {
                        resolve(LINK_BEAUTIFY_CARD.get(name));
                });
            });
        } else {
            meta = LINK_BEAUTIFY_CARD.get(name);
        }

        html = getCardHTML(meta, options.showFavicon);
    } else {
        const file = buildImg(url, createContentDigest);
        const screenshot = {
            success: true, // Whether the screenshot was successfully captured and saved
            file,
        }

        // Check if a screenshot with the same name is being processed
        if (!LINK_BEAUTIFY_IMG.has(name)) {
            LINK_BEAUTIFY_IMG.set(name, false);
            const page = await newPage(browser);
            screenshot.success = await getPageScreenshot(page, file, data, options);
            await closePage(page);

            // Set screenshot status and emit the event
            if (screenshot.success) {
                LINK_BEAUTIFY_IMG.set(name, true);
            } else {
                LINK_BEAUTIFY_IMG.delete(name);
            }
            emitter.emit(`linkPreviewDone-${name}`);
        // Check if a screenshot with the same name has already been done
        } else if (!LINK_BEAUTIFY_IMG.get(name)) {
            screenshot.success = await new Promise((resolve) => {
                emitter.once(`linkPreviewDone-${name}`, () => {
                    resolve(Boolean(LINK_BEAUTIFY_IMG.get(name)));
                });
            });
        }

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
