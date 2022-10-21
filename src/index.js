const visit = require('unist-util-visit');
const {isValidLink, getUrlString} = require('./utils');
const {init, free, task, close} = require('./taskManagement');

require('events').setMaxListeners(0);

module.exports = async ({cache, reporter, markdownAST}, pluginOption) => {
    const tasks = []; // Array of tasks data

    visit(markdownAST, 'link', (node) => {
        const {url, value = url} = node;
        const urlString = getUrlString(value);
        if (!urlString || !isValidLink(node)) {
            return;
        }

        tasks.push({node, url: urlString});
    });

    if (!tasks.length) {
        return markdownAST;
    }

    await init(pluginOption);
    await free(tasks.length);
    await Promise.all(
        tasks.map((t) => task({cache, reporter, ...t}, pluginOption)),
    );
    await close();

    return markdownAST;
};
