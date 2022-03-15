const DEFAULT_TIMEOUT = 30000;
const DEFAULT_SCREENSHOT_QUALITY = 80;
const DEFAULT_CLUSTER_SIZE = 2;

const defaultOption = {
    delimiter: '$card',
    timeout: DEFAULT_TIMEOUT,
    screenshotQuality: DEFAULT_SCREENSHOT_QUALITY,
    showFavicon: true,
    clusterSize: DEFAULT_CLUSTER_SIZE,
    error: {
        title: 'Not Found Site',
    },
};

module.exports = defaultOption;
