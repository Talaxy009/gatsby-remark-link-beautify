import {visit} from 'unist-util-visit';
import {isValidLink, isLinkCard, getUrlString} from './utils.js';
import {init, free, task} from './taskManagement.js';

import EventEmitter from 'events';
EventEmitter.defaultMaxListeners = 0;

/**
 * Default plugin options
 */
const defaultOptions = {
    delimiter: '$card',
    timeout: 30000,
    enableLinkPreview: true,
    screenshotQuality: 80,
    showFavicon: true,
    browserNumber: 3,
    puppeteerLaunchArgs: [],
    error: {title: 'Not Found Site'},
};

/**
 * Astro remark plugin to beautify links
 * @param {object} userOptions user plugin options
 * @returns remark plugin
 */
export default function remarkLinkBeautify(userOptions = {}) {
    const options = {...defaultOptions, ...userOptions};

    return async function transformer(tree) {
        const tasks = [];
        const {enableLinkPreview, delimiter} = options;

        visit(tree, 'link', (node) => {
            const {url, value = url} = node;
            const urlString = getUrlString(value);
            if (!urlString || !isValidLink(node)) {
                return;
            }
            if (!enableLinkPreview && !isLinkCard(node, delimiter)) {
                return;
            }

            tasks.push({node, url: urlString});
        });

        if (!tasks.length) {
            return tree;
        }

        await init(options);
        await free(tasks.length);
        await Promise.all(
            tasks.map((t) => task(t, options)),
        );

        return tree;
    };
}

// Named export for compatibility
export {remarkLinkBeautify};
