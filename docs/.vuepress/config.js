module.exports = {
  base: '/',
  lang: 'zh-CN',
  title: '智付校园整合文档',
  port: 3600,
  plugins: [
    [
      '@vuepress/last-updated',
      {
        transformer: (timestamp, lang) => {
          // 不要忘了安装 moment
          const moment = require('moment')
          moment.locale(lang)
          return moment(timestamp).fromNow()
        }
      }
    ],
    '@vuepress/register-components',
    ['copy-code', { copyMessage: '复制成功！' }]
  ],
  markdown: {
    prism: {
      lineNumbers: true, // 显示行号
    },
  },
  themeConfig: {
    logo: 'https://edu.bosssoftcq.com.cn:60432/favicon.ico',
    sidebarDepth: 2,
    lastUpdated: 'Last Updated',
    nav: [
      { text: '首页', link: '/' },
      { text: 'bosssoft-edu 组件', link: '/docs/guide/' },
      { text: '前端规范', link: '/docs/specification/' },
    ],
    search: false,
    smoothScroll: true, //页面滚动
    sidebar: {
      '/docs/guide/': [
        {
          title: '指南',
          collapsable: false,
          children: [
            {
              title: '介绍',
              collapsable: false,
              path: '/docs/guide/'
            },
            {
              title: '安装',
              collapsable: false,
              path: '/docs/guide/install'
            },
            {
              title: '组件',
              collapsable: false,
              children: [
                {
                  title: 'wPanel 面板',
                  collapsable: false,
                  path: '/docs/guide/component/wPanel',
                }
              ]
            }
          ]
        }],
      '/docs/specification/': [
        {
          title: '前端规范',
          collapsable: false,
          children: [
            {
              title: '页面',
              collapsable: false,
              path: '/docs/specification/'
            },
            {
              title: '自测',
              collapsable: false,
              path: '/docs/specification/selfTest'
            },
          ]
        }
      ]
    }
  }
}