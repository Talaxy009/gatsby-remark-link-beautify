import uniqueSlug from 'unique-slug';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';

const CACHE_PATH = path.resolve(
    process.cwd(),
    'node_modules',
    '.cache',
    'astro-remark-link-beautify',
);

/**
 * Build promise object from puppeteer's method
 * @param {Promise} promise puppeteer's method
 * @returns promise object
 */
export const fetchData = (promise) =>
    promise
        .then((value) => ({done: true, value}))
        .catch((error) => Promise.resolve({done: false, error}));

/**
 * Get value from data or default value
 * @param {object} data data to be checked
 * @param {string} fallback default value
 * @returns data value or default value
 */
export const getDataValue = (data, fallback) => {
    return data.done ? data.value : fallback;
};

/**
 * Check if current link is valid
 * @param {object} node link node
 */
export const isValidLink = (node) => {
    return node.url && node.children[0] && node.children[0].type === 'text';
};

/**
 * Check if current node need to be converted to link card
 * @param {object} node node object
 * @param {string} delimiter delimiter to be used
 */
export const isLinkCard = (node, delimiter) => {
    return node.children[0].value === delimiter;
};

/**
 * Get formatted url string
 * @param {string} url url string to be formatted
 * @returns formatted url string
 */
export const getUrlString = (url) => {
    const urlString = url.startsWith('http') ? url : `https://${url}`;

    try {
        return new URL(urlString).toString();
    } catch (error) {
        return '';
    }
};

/**
 * Get hostname from url
 * @param {string} url url string to be parsed
 * @returns hostname string
 */
export const getHostnameFromUrl = (url) => {
    try {
        return new URL(url).hostname;
    } catch (error) {
        return '';
    }
};

/**
 * Create content digest
 * @param {string} content content to create digest from
 * @returns content digest string
 */
const createContentDigest = (content) => {
    return crypto.createHash('md5').update(content).digest('hex');
};

/**
 * Build image file object
 * @param {string} url website url
 * @returns file object
 */
export const buildImg = (url) => {
    const name = uniqueSlug(url);
    const contentDigest = createContentDigest(url);
    const extension = 'jpg';
    const base = name + '.' + extension;

    return {
        name,
        base,
        extension,
        internal: {contentDigest},
        absolutePath: path.resolve(CACHE_PATH, base),
    };
};

/**
 * Build image Map object from cache
 * @returns Map object
 */
export const setImgMap = () => {
    const result = new Map();
    if (!fs.existsSync(CACHE_PATH)) {
        fs.mkdirSync(CACHE_PATH, {recursive: true});
    }
    fs.readdirSync(CACHE_PATH).forEach((v) => result.set(v.slice(0, -4), true));
    return result;
};

/**
 * Get the cache path
 * @returns cache path string
 */
export const getCachePath = () => CACHE_PATH;
