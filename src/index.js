const visit = require('unist-util-visit');
const puppeteer = require('puppeteer');

const {getHTML: getCardHTML, getPageData} = require('./linkCard');
const {getHTML: getPreviewHTML, getPageScreenshot} = require('./linkPreview');
const {isValidLink, isLinkCard, getUrlString} = require('./utils');

const defaultOption = require('../shared/defaultOption');

require('events').setMaxListeners(0);

module.exports = async ({cache, markdownAST}, pluginOption) => {
	const options = {...defaultOption, ...pluginOption};
	const {delimiter, showFavicon} = options;
	const browser = await puppeteer.launch();
	const promises = [];

	visit(markdownAST, 'link', (node) => {
		const {url, value = url} = node;
		const urlString = getUrlString(value);
		if (!urlString || !isValidLink(node)) {
			return;
		}

		promises.push(
			new Promise(async (resolve) => {
				let html = await cache.get(urlString);

				if (!html) {
					if (isLinkCard(node, delimiter)) {
						const data = await getPageData(browser, url, options);
						html = getCardHTML(data, showFavicon);
					} else {
						// prettier-ignore
						const screenshot = await getPageScreenshot(browser, url, options);
						html = getPreviewHTML(node, screenshot);
					}
					await cache.set(urlString, html);
				}

				node.type = 'html';
				node.value = html;
				node.children = undefined;
				resolve();
			}),
		);
	});

	try {
		await Promise.all(promises);
	} catch (e) {
		console.error(e);
	} finally {
		await browser.close();
		return markdownAST;
	}
};
