const visit = require('unist-util-visit');
const {Cluster} = require('puppeteer-cluster');

const {getHTML: getCardHTML, getPageData} = require('./linkCard');
const {getHTML: getPreviewHTML, getPageScreenshot} = require('./linkPreview');
const {isValidLink, isLinkCard, getUrlString} = require('./utils');

const defaultOption = require('../shared/defaultOption');

require('events').setMaxListeners(0);

module.exports = async ({cache, markdownAST}, pluginOption) => {
    const options = {...defaultOption, ...pluginOption};
    const {delimiter, showFavicon, clusterSize, timeout} = options;
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: clusterSize,
        timeout: timeout,
    });

    await cluster.task(async ({page, data}) => {
        const {node, url} = data;
        let html = await cache.get(url);

        if (!html) {
            if (isLinkCard(node, delimiter)) {
                const data = await getPageData(page, url, options);
                html = getCardHTML(data, showFavicon);
            } else {
                // prettier-ignore
                const screenshot = await getPageScreenshot(page, url, options);
                html = getPreviewHTML(node, screenshot);
            }
            await cache.set(url, html);
        }

        node.type = 'html';
        node.value = html;
        node.children = undefined;
    });

    visit(markdownAST, 'link', (node) => {
        const {url, value = url} = node;
        const urlString = getUrlString(value);
        if (!urlString || !isValidLink(node)) {
            return;
        }

        cluster.queue({node, url: urlString});
    });

    await cluster.idle();
    await cluster.close();
    return markdownAST;
};
