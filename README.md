# gatsby-remark-link-beautify

A gatsby plugin to beautify links by previewing them.

[中文文档](https://github.com/Talaxy009/gatsby-remark-link-beautify/blob/main/README-zh.md)

[![npm version](https://badge.fury.io/js/gatsby-remark-link-beautify.svg)](https://badge.fury.io/js/gatsby-remark-link-beautify)

## ✨ Features

This plugin has two main features:

- It adds a screenshot of the link's target page to the link's tooltip. When hovering over the link it will show the screenshot.
- It embeds card with the link's target website information in the page. It only does this in the situation [below](#LinkCard).

The example below are using the `twitter-card` themes.

![example](https://github.com/Talaxy009/gatsby-remark-link-beautify/raw/main/assets/example.gif)

## 🚚 Installation

```shell
npm install gatsby-remark-link-beautify
```

or

```shell
yarn add gatsby-remark-link-beautify
```

This plugin requires `gatsby-transformer-remark`.

## 🔦 Usage

1. Enable the plugin in your gatsby-config.js

    ```js
    // In your gatsby-config.js
    plugins: [
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [`gatsby-remark-link-beautify`],
            },
        },
    ];
    ```

    or

    ```js
    // In your gatsby-config.js
    plugins: [
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    {
                        resolve: `gatsby-remark-link-beautify`,
                        options: {
                            // your options here
                        },
                    },
                ],
            },
        },
    ];
    ```

2. Load the plugin's CSS

    ```js
    // In your gatsby-browser.js
    import 'gatsby-remark-link-beautify/themes/notion.css';
    ```

    There are two themes available: `notion.css` and `twitter-card.css`. Choose your preferred theme or just load a custom one.

After that, you can use the plugin in two ways:

### LinkPreview

Using link in markdown as normal:

```md
[Gatsby](https://www.gatsbyjs.org/) is a free and open source framework for developing blazing fast websites and apps.
```

Then the plugin will add a screenshot of the link's target page to the link's tooltip. When hovering over the link it will show the screenshot.

### LinkCard

Using link in markdown with the delimiter in a single line:

```md
This is the Github repository:

[$card](https://github.com/gatsbyjs/gatsby/)
```

Then the plugin will embed a card with the link's target website information in the page.

## 🔧 Options

| Name                | Type      | Default                     | Description                               |
| ------------------- | --------- | --------------------------- | ----------------------------------------- |
| delimiter           | `string`  | `$card`                     | Title of the link to create a card        |
| timeout             | `number`  | `30000`                     | Default timeout(ms) for puppeteer         |
| enableLinkPreview   | `boolean` | `true`                      | Whether to generate preview images or not |
| screenshotQuality   | `number`  | `80`                        | The quality of the screenshot images in % |
| showFavicon         | `boolean` | `true`                      | Whether to show the favicon or not        |
| browserNumer        | `number`  | `3`                         | Number of browsers launched               |
| puppeteerLaunchArgs | `array`   | `[]`                        | Arguments for puppeteer launch            |
| error               | `object`  | `{title: 'Not Found Site'}` | Default config when error                 |

### About `browserNumer`

`browserNumer` is the number of browsers launched. This plugin will open 5 tabs per browser at most, so 15 pages can be handled at the same time in default. It is recommended to set `browserNumer` depending on the size of your memory.

### About `puppeteerLaunchArgs`

`puppeteerLaunchArgs` will be passed into `puppeteer.launch` as `args` arguments, where you can configure `puppeteer` launch parameters directly.

## 🚑️ Troubleshooting

### Gatsby Cloud

Since Gatsby Cloud does not support any custom binaries or WASM packages like Puppeteer (see [Gatsby issue 20970](https://github.com/gatsbyjs/gatsby/issues/20970) and [Gatsby issue 31839]( https://github.com/gatsbyjs/gatsby/issues/31839)). So projects that rely on this plugin may have unpredictable problems (e.g., errors, timeouts) when building on Gatsby Cloud, please choose to remove this plugin or migrate your project to another service that supports Puppeteer (e.g. Netlify).

### sharp

Version `1.2.x` and `2.0.x` of this plugin will use the [sharp](https://github.com/lovell/sharp) to resize screenshots. According to the [gatsby-plugin-sharp documentation](https://www.gatsbyjs.com/plugins/gatsby-plugin-sharp/#troubleshooting), it might cause some issues when there are multiple incompatible versions of the `sharp` dependency in different packages. If you encounter such issues, please update the dependencies according to the official documentation mentioned above.

**better solution:** It is recommended to use the `2.1.0` or higher version of this plugin. Which no longer relies on sharp, but calls the method of the official plugin [gatsby-plugin-sharp](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-sharp) to process screenshots.

## 💡 Inspiration

This plugin is inspired by [gatsby-remark-link-preview](https://github.com/lichin-lin/gatsby-remark-link-preview/), and added some of my thoughts. Such as customizing the component's style, don't show the error message on the card if fetch meta data failed (because the SEO of some websites may not be perfect) and previewing all links with the screenshot. Due to excessive changes, I decided to make a new plugin.

Thanks to [@lichin-lin](https://github.com/lichin-lin) and [@JaeYeopHan](https://github.com/JaeYeopHan)
