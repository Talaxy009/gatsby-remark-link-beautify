const md5 = require('md5');
const path = require('path');

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
 * @returns file object
 */
const buildImg = (url) => {
    const name = md5(url);
    const extension = 'jpg';
    const base = name + '.' + extension;

    return {
        name,
        base,
        extension,
        internal: {contentDigest: name},
        absolutePath: path.resolve(
            process.cwd(),
            '.cache',
            'linkBeautify',
            base,
        ),
    };
};

module.exports = {
    fetchData,
    getDataValue,
    isValidLink,
    isLinkCard,
    getUrlString,
    buildImg,
};
