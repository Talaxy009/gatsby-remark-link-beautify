import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import {getCachePath} from './utils.js';

/**
 * Get page screenshot from url by puppeteer
 * @param {import('puppeteer').Page} page puppeteer page object
 * @param {object} file file obj
 * @param {object} data task data
 * @param {object} options options
 * @returns success status
 */
export const getPageScreenshot = async (page, file, data, options) => {
    const {url} = data;

    try {
        const response = await page.goto(url, {
            timeout: options.timeout,
            waitUntil: 'load',
        });
        if (response && response.status() === 404) {
            console.warn(`link-beautify: Page ${url} 404 not found`);
        }
        await page.screenshot({path: file.absolutePath});

        return true;
    } catch (e) {
        console.warn(`link-beautify: Unable to get screenshot from ${url}`);
        return false;
    }
};

/**
 * Process screenshot with sharp to resize and optimize
 * @param {object} file file object
 * @param {number} quality image quality
 * @returns processed image data
 */
const processScreenshot = async (file, quality) => {
    const cachePath = getCachePath();
    const processedName = `${file.name}-processed.webp`;
    const processedPath = path.resolve(cachePath, processedName);

    try {
        // Resize to 400px width and convert to webp
        await sharp(file.absolutePath)
            .resize(400, null, {
                withoutEnlargement: true,
            })
            .webp({quality})
            .toFile(processedPath);

        // Read the file as base64 for inline display or return the path
        const buffer = fs.readFileSync(processedPath);
        const base64 = buffer.toString('base64');

        // Get a tiny base64 for placeholder
        const placeholderBuffer = await sharp(file.absolutePath)
            .resize(20, null, {withoutEnlargement: true})
            .blur(5)
            .webp({quality: 20})
            .toBuffer();
        const placeholderBase64 = placeholderBuffer.toString('base64');

        return {
            success: true,
            src: `data:image/webp;base64,${base64}`,
            placeholder: `data:image/webp;base64,${placeholderBase64}`,
        };
    } catch (error) {
        console.warn(`link-beautify: Unable to process screenshot: ${error.message}`);
        return {success: false};
    }
};

/**
 * Build html string from page data
 * @param {object} data task data
 * @param {object} screenshot screenshot obj
 * @param {number} quality image quality
 * @returns html string
 */
export const getHTML = async (data, screenshot, quality) => {
    const {node} = data;
    const linkHtml = `
    <a target="_blank" rel="noopener noreferrer" href="${node.url}">
        ${node.children[0].value}
    </a>`;

    if (!screenshot.success) return linkHtml;

    try {
        const processedImage = await processScreenshot(screenshot.file, quality);

        if (!processedImage.success) return linkHtml;

        return `
        <span class="link-preview-container">
            ${linkHtml}
            <img
                loading="lazy"
                decoding="async"
                alt="site preview image"
                src="${processedImage.src}"
                style="background-image: url('${processedImage.placeholder}'); background-size: cover;"
            />
        </span>`.trim();
    } catch (error) {
        console.warn(`link-beautify: Error building preview HTML: ${error.message}`);
        return linkHtml;
    }
};
