# astro-remark-link-beautify

一个通过预览目标网页以实现链接美化的 Astro remark 插件。这是 [gatsby-remark-link-beautify](https://github.com/Talaxy009/gatsby-remark-link-beautify) 的 Astro 兼容版本。

## ✨ 功能

本插件主要有两个功能：

- 它可以将目标页面的截图添加到链接的提示中。当把鼠标悬停在链接上时，它将显示该截图。
- 它可以在页面中嵌入了带有目标网站信息的卡片。它只在 [下面](#生成卡片) 的情况下这样做。

## 🚚 安装

```shell
npm install astro-remark-link-beautify
```

或

```shell
yarn add astro-remark-link-beautify
```

或

```shell
pnpm add astro-remark-link-beautify
```

## 🔦 使用方法

1. 修改你的 `astro.config.mjs` 文件以启用本插件：

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

或者带配置选项：

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import remarkLinkBeautify from 'astro-remark-link-beautify';

export default defineConfig({
    markdown: {
        remarkPlugins: [
            [remarkLinkBeautify, {
                // 你的插件配置
                delimiter: '$card',
                enableLinkPreview: true,
            }],
        ],
    },
});
```

2. 在你的布局文件或全局样式中加载本插件的 CSS：

```js
// 在你的布局文件或全局 CSS 中
import 'astro-remark-link-beautify/themes/notion.css';
```

或者在你的 CSS/SCSS 文件中：

```css
@import 'astro-remark-link-beautify/themes/notion.css';
```

有两种主题样式可选：`notion.css` 或 `twitter-card.css`。选择一个你喜欢的或是直接加载一个自定义的样式。

之后你就可以通过以下方式使用本插件：

### 预览目标网页

像平时一样在 Markdown 中使用链接：

```md
[Astro](https://astro.build/) 是专为内容驱动型网站设计的 Web 框架。
```

然后本插件就会将目标页面的截图添加到这个链接的提示中。当把鼠标悬停在链接上时，就会显示该截图。

### 生成卡片

像平时一样在 Markdown 中使用链接，不过要把方括号里的文本改成你配置的 `delimiter`：

```md
这是 Github 仓库：

[$card](https://github.com/withastro/astro/)
```

然后，本插件将在页面中嵌入一个带有该链接的目标网站信息的卡片。

## 🔧 配置选项

| 配置名              | 类型      | 默认值                      | 描述                         |
| ------------------- | --------- | --------------------------- | ---------------------------- |
| delimiter           | `string`  | `$card`                     | 需要创建卡片的链接标识       |
| timeout             | `number`  | `30000`                     | puppeteer 的超时时间（毫秒） |
| enableLinkPreview   | `boolean` | `true`                      | 是否启用链接预览截图         |
| screenshotQuality   | `number`  | `80`                        | 截图的质量（百分比）         |
| showFavicon         | `boolean` | `true`                      | 是否显示网站图标             |
| browserNumber       | `number`  | `3`                         | 启动的浏览器数               |
| puppeteerLaunchArgs | `array`   | `[]`                        | puppeteer 启动参数           |
| error               | `object`  | `{title: 'Not Found Site'}` | 获取网站信息错误时的默认值   |

### 关于 `browserNumber`

`browserNumber` 指的是启动的浏览器的数量。本插件最多为每个浏览器打开 5 个标签，所以默认情况下可以同时处理 15 个页面。建议根据你的内存大小来设置 `browserNumber`。

### 关于 `puppeteerLaunchArgs`

`puppeteerLaunchArgs` 会作为 `args` 参数传入 `puppeteer.launch` 中，你可以在这里直接配置 `puppeteer` 的启动参数。

## 🚑️ 疑难解答

### Puppeteer

由于本插件使用 Puppeteer 来截取网站截图，请确保你的环境支持运行 Puppeteer。在某些 CI/CD 平台（如 Vercel）上，你可能需要正确配置 Puppeteer 或使用无头浏览器服务。

### 常用 Puppeteer 启动参数

对于资源有限的环境，你可能需要添加这些参数：

```js
remarkLinkBeautify({
    puppeteerLaunchArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
    ],
})
```

## 💡 致谢

本插件基于 [@Talaxy009](https://github.com/Talaxy009) 的 [gatsby-remark-link-beautify](https://github.com/Talaxy009/gatsby-remark-link-beautify)。

## 许可证

MIT
