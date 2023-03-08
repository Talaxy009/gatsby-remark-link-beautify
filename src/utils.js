const uniqueSlug = require('unique-slug');
const path = require('path');
const fs = require('fs');

const CACHE_PATH = path.resolve(
    process.cwd(),
    '.cache',
    'caches',
    'gatsby-remark-link-beautify',
);

/**
 * build promise object from puppeteer's method
 * @param {Promise} promise puppeteer's method
 * @returns promise object
 */
const fetchData = (promise) =>
    promise
        .then((value) => ({done: true, value}))
        .catch((error) => Promise.resolve({done: false, error}));

/**
 * get value from data or default value
 * @param {object} data data to be checked
 * @param {string} fallback default value
 * @returns data value or default value
 */
const getDataValue = (data, fallback) => {
    return data.done ? data.value : fallback;
};

/**
 * check if current link is valid
 * @param {object} node link node
 */
const isValidLink = (node) => {
    return node.url && node.children[0] && node.children[0].type === 'text';
};

/**
 * check if current node need to be converted to link card
 * @param {object} node node object
 * @param {string} delimiter delimiter to be used
 */
const isLinkCard = (node, delimiter) => {
    return node.children[0].value === delimiter;
};

/**
 * get formatted url string
 * @param {string} url url string to be formatted
 * @returns formatted url string
 */
const getUrlString = (url) => {
    const urlString = url.startsWith('http') ? url : `https://${url}`;

    try {
        return new URL(urlString).toString();
    } catch (error) {
        return null;
    }
};

/**
 * build image file object
 * @param {string} url website url
 * @param {Function} createContentDigest contentDigest builder
 * @returns file object
 */
const buildImg = (url, createContentDigest) => {
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
const setImgMap = () => {
    const result = new Map();
    fs.readdirSync(CACHE_PATH).forEach((v) => result.set(v.slice(0, -4), true));
    return result;
};

module.exports = {
    fetchData,
    getDataValue,
    isValidLink,
    isLinkCard,
    getUrlString,
    buildImg,
    setImgMap,
};
