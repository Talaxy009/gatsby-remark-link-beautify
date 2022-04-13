const DEFAULT_TIMEOUT = 30000;
const DEFAULT_SCREENSHOT_QUALITY = 80;
const DEFAULT_BROSWER_NUMBER = 4;

const defaultOption = {
    delimiter: '$card',
    timeout: DEFAULT_TIMEOUT,
    screenshotQuality: DEFAULT_SCREENSHOT_QUALITY,
    showFavicon: true,
    browserNumer: DEFAULT_BROSWER_NUMBER,
    puppeteerLaunchArgs: [],
    error: {
        title: 'Not Found Site',
    },
};

module.exports = defaultOption;
