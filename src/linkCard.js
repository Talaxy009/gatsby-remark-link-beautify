const puppeteer = require('puppeteer');

const {fetchData, getDataValue, getHostnameFromUrl} = require('./utils');

/**
 * get page data from url by puppeteer
 * @param {puppeteer.Page} page puppeteer page object
 * @param {string} url the url to be fetched
 * @param {object} options options
 * @returns page data
 */
const getPageData = async (page, data, options) => {
    const {url, reporter} = data;
    const Default = {
        success: false,
        title: getHostnameFromUrl(url) ?? options.error.title,
        description: '',
        favicon: '',
        icon: url + 'favicon.ico',
        ogImage: '',
        url,
    };

    try {
        await page.goto(url, {
            timeout: options.timeout,
            waitUntil: 'domcontentloaded',
        });

        // prettier-ignore
        const [titleData, descriptionData, ogImageData, faviconData, iconData] =
            await Promise.all([
                fetchData(page.title()),
                fetchData(page.$eval("meta[property='og:description']", (el) => el.content)),
                fetchData(page.$eval("meta[property='og:image']", (el) => el.content)),
                fetchData(page.$eval("link[rel='shortcut icon']", (el) => el.href)),
                fetchData(page.$eval("link[rel='icon']", (el) => el.href)),
            ]);

        // prettier-ignore
        const description = getDataValue(descriptionData, Default.description);
        const ogImage = getDataValue(ogImageData, Default.ogImage);
        let favicon = getDataValue(faviconData, Default.favicon);
        const title = getDataValue(titleData, Default.title);
        const icon = getDataValue(iconData, Default.icon);

        if (!favicon) {
            favicon = icon;
        }

        return {
            success: true,
            description,
            ogImage,
            favicon,
            title,
            url,
        };
    } catch (e) {
        reporter.warn(`link-beautify: Unable to get page data from ${url}`);
        return Default;
    }
};

/**
 * build html string from page data
 * @param {object} pageData page data from puppeteer
 * @param {boolean} showFavicon show favicon or not
 * @returns html string
 */
const getHTML = (pageData, showFavicon) => {
    const {title, description, favicon, url, ogImage} = pageData;

    return `
    <div>
        <a target="_blank" rel="noopener noreferrer" href="${url}" class="link-card-container">
            <div class="link-card-wrapper">
                <div class="link-card-text">
                    <div class="link-card-title">${title}</div>
                    ${
                        description && description !== 'undefined'
                            ? `<div class="link-card-description">${description}</div>`
                            : ''
                    }
                </div>
                <div class="link-card-url">
                    ${
                        showFavicon && favicon && favicon !== 'undefined'
                            ? `<img class="link-card-favicon" src="${favicon}" alt="${title}-favicon"/>`
                            : ''
                    }
                    <div class="link-card-link">${url}</div>
                </div>
            </div>
            ${
                ogImage && ogImage !== 'undefined'
                    ? `<div class="link-card-image-wrapper">
                            <img class="link-card-image" alt="${title}-image" src="${ogImage}" />
                        </div>`
                    : ''
            }
        </a>
    </div>`.trim();
};

module.exports = {
    getPageData,
    getHTML,
};
