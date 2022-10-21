exports.pluginOptionsSchema = ({Joi}) => {
    return Joi.object({
        delimiter: Joi.string()
            .default('$card')
            .description('Title of the link to create a card'),
        timeout: Joi.number()
            .default(30000)
            .description('Default timeout(ms) for puppeteer'),
        screenshotQuality: Joi.number()
            .default(80)
            .description('The quality of the screenshot in %'),
        showFavicon: Joi.boolean()
            .default(true)
            .description('Whether to show the favicon or not'),
        browserNumer: Joi.number()
            .default(3)
            .description('Number of browsers launched'),
        puppeteerLaunchArgs: Joi.array()
            .items(Joi.string())
            .default([])
            .description('Arguments for puppeteer launch'),
        error: Joi.object({
            title: Joi.string(),
        })
            .default({title: 'Not Found Site'})
            .description('Default config when error'),
    });
};
