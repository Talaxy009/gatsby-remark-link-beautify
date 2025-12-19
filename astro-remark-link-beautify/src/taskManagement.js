import puppeteer from 'puppeteer';
import uniqueSlug from 'unique-slug';
import EventEmitter from 'events';

import {getHTML as getCardHTML, getPageData} from './linkCard.js';
import {getHTML as getPreviewHTML, getPageScreenshot} from './linkPreview.js';
import {isLinkCard, buildImg, setImgMap} from './utils.js';

const emitter = new EventEmitter();
const PAGE_NUMBER_PER_BROWSER = 5;

// Global state management
let WSE_LIST = null;
let PUPPETEER_PAGE_NUMBER = 0;
let LINK_BEAUTIFY_LISTENER = 0;
let LINK_BEAUTIFY_TASKS = [];
let LINK_BEAUTIFY_IMG = null;
let LINK_BEAUTIFY_CARD = null;

/**
 * Initialize puppeteer and add websocket endpoint to WSE_LIST
 * @param {object} options plugin options
 * @returns {Promise} If browser is ready, return immediately otherwise wait for it
 */
export const init = async (options) => {
    const {browserNumber: num, puppeteerLaunchArgs: args} = options;
    if (WSE_LIST) {
        if (WSE_LIST.length >= num) {
            return;
        } else {
            return new Promise((resolve) => {
                emitter.once('linkBeautifyInit', resolve);
            });
        }
    }
    WSE_LIST = [];
    PUPPETEER_PAGE_NUMBER = 0;
    LINK_BEAUTIFY_LISTENER = 0;
    LINK_BEAUTIFY_TASKS = [];
    LINK_BEAUTIFY_IMG = setImgMap();
    LINK_BEAUTIFY_CARD = new Map();
    
    while (WSE_LIST.length < num) {
        const browser = await puppeteer.launch({headless: 'new', args});
        WSE_LIST.push(browser.wsEndpoint());
    }
    emitter.emit('linkBeautifyInit');
};

/**
 * Close all browsers if there are no task running
 */
export const close = async () => {
    if (PUPPETEER_PAGE_NUMBER === 0 && WSE_LIST) {
        LINK_BEAUTIFY_LISTENER = 0;
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
export const free = (tasksNum) => {
    if (
        tasksNum < 3 ||
        PUPPETEER_PAGE_NUMBER < PAGE_NUMBER_PER_BROWSER * WSE_LIST.length
    ) {
        return;
    }
    const number = ++LINK_BEAUTIFY_LISTENER;
    LINK_BEAUTIFY_TASKS.push({no: number, size: tasksNum});
    return new Promise((resolve) => {
        emitter.once(`linkBeautifyFree-${number}`, resolve);
    });
};

/**
 * Create a new page
 * @param {import('puppeteer').Browser} browser puppeteer browser
 */
const newPage = (browser) => {
    PUPPETEER_PAGE_NUMBER++;
    return browser.newPage();
};

/**
 * Close page
 * @param {import('puppeteer').Page} page puppeteer page
 */
const closePage = (page) => {
    let freeNum =
        PAGE_NUMBER_PER_BROWSER * WSE_LIST.length - --PUPPETEER_PAGE_NUMBER;
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
export const task = async (data, options) => {
    const browserWSEndpoint =
        WSE_LIST[Math.floor(Math.random() * WSE_LIST.length)];
    const browser = await puppeteer.connect({browserWSEndpoint});

    const {node, url} = data;
    const name = uniqueSlug(url);
    let html;

    if (isLinkCard(node, options.delimiter)) {
        let meta = null;

        if (!LINK_BEAUTIFY_CARD.has(name)) {
            LINK_BEAUTIFY_CARD.set(name, null);
            const page = await newPage(browser);
            meta = await getPageData(page, data, options);
            await closePage(page);

            LINK_BEAUTIFY_CARD.set(name, meta);
            emitter.emit(`linkCardDone-${name}`);
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
        const file = buildImg(url);
        const screenshot = {
            success: true,
            file,
        };

        if (!LINK_BEAUTIFY_IMG.has(name)) {
            LINK_BEAUTIFY_IMG.set(name, false);
            const page = await newPage(browser);
            screenshot.success = await getPageScreenshot(
                page,
                file,
                data,
                options,
            );
            await closePage(page);

            if (screenshot.success) {
                LINK_BEAUTIFY_IMG.set(name, true);
            } else {
                LINK_BEAUTIFY_IMG.delete(name);
            }
            emitter.emit(`linkPreviewDone-${name}`);
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
    node.children = [];
};
