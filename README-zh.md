# gatsby-remark-link-beautify

一个通过预览目标网页以实现链接美化的 Gatsby 插件。

[English Version](https://github.com/Talaxy009/gatsby-remark-link-beautify/blob/main/README.md)

[![npm version](https://badge.fury.io/js/gatsby-remark-link-beautify.svg)](https://badge.fury.io/js/gatsby-remark-link-beautify)

## ✨ 功能

本插件主要有两个功能：

- 它可以将目标页面的截图添加到链接的提示中。当把鼠标悬停在链接上时，它将显示该截图。
- 它可以在页面中嵌入了带有目标网站信息的卡片。它只在 [下面](#LinkCard) 的情况下这样做。

下面的示例使用了 `twitter-card` 主题。

![example](https://github.com/Talaxy009/gatsby-remark-link-beautify/raw/main/assets/example.gif)

## 🚚 安装

```shell
npm install gatsby-remark-link-beautify
```

或

```shell
yarn add gatsby-remark-link-beautify
```

另外，本插件依赖 `gatsby-transformer-remark`。

## 🔦 使用方法

1. 修改你的 gatsby-config.js 文件以启用本插件

    ```js
    // 你的 gatsby-config.js
    plugins: [
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [`gatsby-remark-link-beautify`],
            },
        },
    ];
    ```

    或

    ```js
    // 你的 gatsby-config.js
    plugins: [
        {
            resolve: `gatsby-transformer-remark`,
            options: {
                plugins: [
                    {
                        resolve: `gatsby-remark-link-beautify`,
                        options: {
                            // 你的插件配置
                        },
                    },
                ],
            },
        },
    ];
    ```

2. 加载本插件的 CSS

    ```js
    // 你的 gatsby-browser.js
    import 'gatsby-remark-link-beautify/themes/notion.css';
    ```

    有两种主题样式可选：`notion.css` 或 `twitter-card.css`。选择一个你喜欢的或是直接加载一个自定义的样式。

之后你就可以通过以下方式使用本插件：

### 预览目标网页

像平时一样在 Markdown 中使用链接：

```md
[Gatsby](https://www.gatsbyjs.org/) is a free and open source framework for developing blazing fast websites and apps.
```

然后本插件就会将目标页面的截图添加到这个链接的提示中。当把鼠标悬停在链接上时，就会显示该截图。

### 生成卡片

像平时一样在 Markdown 中使用链接，不过要把方括号里的文本改成你配置的 `delimiter`：

```md
This is the Github repository:

[$card](https://github.com/gatsbyjs/gatsby/)
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
| browserNumer        | `number`  | `3`                         | 启动的浏览器数               |
| puppeteerLaunchArgs | `array`   | `[]`                        | puppeteer 启动参数           |
| error               | `object`  | `{title: 'Not Found Site'}` | 获取网站信息错误时的默认值   |

### 关于 `browserNumer`

`browserNumer` 指的是启动的浏览器的数量。本插件最多为每个浏览器打开 5 个标签，所以默认情况下可以同时处理 15 个页面。建议根据你的内存大小来设置 `browserNumer`。

### 关于 `puppeteerLaunchArgs`

`puppeteerLaunchArgs` 会作为 `args` 参数传入 `puppeteer.launch` 中，你可以在这里直接配置 `puppeteer` 的启动参数。

## 🚚 疑难解答

### Gatsby Cloud

由于 Gatsby Cloud 不支持在其内部运行 Puppeteer 之类的可执行程序（详见：[Gatsby issue 20970](https://github.com/gatsbyjs/gatsby/issues/20970) 和 [Gatsby issue 31839](https://github.com/gatsbyjs/gatsby/issues/31839)），因此依赖本插件的项目在 Gatsby Cloud 上构建可能会出现不可预测的问题（比如报错、超时），因此请选择移除本插件或是将项目迁移至其他支持 Puppeteer 的服务（比如 Netlify）上进行。

### sharp 相关

`1.2.x` 和 `2.0.x` 版本的本插件会使用 [sharp](https://github.com/lovell/sharp)来调整截图尺寸和质量。根据据 [gatsby-plugin-sharp 的官方文档](https://www.gatsbyjs.com/plugins/gatsby-plugin-sharp/#troubleshooting)，当项目中有多个互不兼容的不同版本 `sharp` 依赖时可能会产生报错。如果你遇到了类似的问题，请更新上述文档中列举的官方插件。

**更优解：** 推荐使用 `2.1.0` 或更高版本的本插件，此版本不再单独依赖 sharp 而是调用官方插件 [gatsby-plugin-sharp](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-sharp) 的方法来处理截图。

## 💡 启发

本项目受了 [gatsby-remark-link-preview](https://github.com/lichin-lin/gatsby-remark-link-preview/) 的启发且添加了我的一些想法。比如可以自定义组件样式，当爬取网站信息失败时不显示错误消息（因为一些网站的 SEO 并不完善）以及可以通过截图来预览目标站点。由于代码变动十分之大，我决定自己发布一个插件。

感谢 [@lichin-lin](https://github.com/lichin-lin) 和 [@JaeYeopHan](https://github.com/JaeYeopHan)
