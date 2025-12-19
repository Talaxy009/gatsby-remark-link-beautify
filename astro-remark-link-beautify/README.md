# astro-remark-link-beautify

An Astro remark plugin to beautify links by previewing them. This is an Astro-compatible port of [gatsby-remark-link-beautify](https://github.com/Talaxy009/gatsby-remark-link-beautify).

## ✨ Features

This plugin has two main features:

- It adds a screenshot of the link's target page to the link's tooltip. When hovering over the link it will show the screenshot.
- It embeds card with the link's target website information in the page. It only does this in the situation [below](#linkcard).

## 🚚 Installation

```shell
npm install astro-remark-link-beautify
```

or

```shell
yarn add astro-remark-link-beautify
```

or

```shell
pnpm add astro-remark-link-beautify
```

## 🔦 Usage

1. Enable the plugin in your `astro.config.mjs`:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import remarkLinkBeautify from 'astro-remark-link-beautify';

export default defineConfig({
    markdown: {
        remarkPlugins: [remarkLinkBeautify],
    },
});
```

or with options:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import remarkLinkBeautify from 'astro-remark-link-beautify';

export default defineConfig({
    markdown: {
        remarkPlugins: [
            [remarkLinkBeautify, {
                // your options here
                delimiter: '$card',
                enableLinkPreview: true,
            }],
        ],
    },
});
```

2. Load the plugin's CSS in your layout or global styles:

```js
// In your layout file or global CSS
import 'astro-remark-link-beautify/themes/notion.css';
```

Or in your CSS/SCSS file:

```css
@import 'astro-remark-link-beautify/themes/notion.css';
```

There are two themes available: `notion.css` and `twitter-card.css`. Choose your preferred theme or create a custom one.

After that, you can use the plugin in two ways:

### LinkPreview

Using link in markdown as normal:

```md
[Astro](https://astro.build/) is the web framework for content-driven websites.
```

Then the plugin will add a screenshot of the link's target page to the link's tooltip. When hovering over the link it will show the screenshot.

### LinkCard

Using link in markdown with the delimiter in a single line:

```md
This is the Github repository:

[$card](https://github.com/withastro/astro/)
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
| browserNumber       | `number`  | `3`                         | Number of browsers launched               |
| puppeteerLaunchArgs | `array`   | `[]`                        | Arguments for puppeteer launch            |
| error               | `object`  | `{title: 'Not Found Site'}` | Default config when error                 |

### About `browserNumber`

`browserNumber` is the number of browsers launched. This plugin will open 5 tabs per browser at most, so 15 pages can be handled at the same time in default. It is recommended to set `browserNumber` depending on the size of your memory.

### About `puppeteerLaunchArgs`

`puppeteerLaunchArgs` will be passed into `puppeteer.launch` as `args` arguments, where you can configure `puppeteer` launch parameters directly.

## 🚑️ Troubleshooting

### Puppeteer

Since this plugin uses Puppeteer to take screenshots of websites, make sure your environment supports running Puppeteer. On some CI/CD platforms (like Vercel), you may need to configure Puppeteer properly or use a headless browser service.

### Common Puppeteer Launch Arguments

For environments with limited resources, you might need to add these arguments:

```js
remarkLinkBeautify({
    puppeteerLaunchArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
    ],
})
```

## 💡 Credits

This plugin is based on [gatsby-remark-link-beautify](https://github.com/Talaxy009/gatsby-remark-link-beautify) by [@Talaxy009](https://github.com/Talaxy009).

## License

MIT
