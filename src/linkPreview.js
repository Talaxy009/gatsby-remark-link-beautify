const puppeteer = require('puppeteer');

/**
 * get page data from url by puppeteer
 * @param {puppeteer.Page} page puppeteer page object
 * @param {string} url the url to be fetched
 * @param {object} options options
 * @returns screenshot image in base64
 */
const getPageScreenshot = async (page, url, options) => {
	try {
		await page.goto(url);
		await page.waitForTimeout(2000);
		const screenshot = await page.screenshot({
			type: 'jpeg',
			quality: options.screenshotQuality,
			encoding: 'base64',
		});

		return screenshot;
	} catch (e) {
		console.error(`Unable to get screenshot from ${url}`);
		return '';
	}
};

/**
 * build html string from page data
 * @param {object} node link node
 * @param {string} screenshot image in base64
 * @returns html string
 */
const getHTML = (node, screenshot) => {
	const {url, children} = node;

	return `
    <span class="link-preview-container">
    	<a target="_blank" rel="noopener noreferrer" href="${url}">
        	${children[0].value}
    	</a>
		${screenshot && `<img src="data:image/jpeg;base64,${screenshot}" />`}
    </span>
  `.trim();
};

module.exports = {
	getPageScreenshot,
	getHTML,
};
