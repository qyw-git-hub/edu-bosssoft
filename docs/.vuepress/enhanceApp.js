import './public/index.styl'
import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import hljs from 'highlight.js'
import 'highlight.js/styles/color-brewer.css'

Vue.directive('highlight', function (el) {
  let blocks = el.querySelectorAll('pre code');
  blocks.forEach((block) => {
    hljs.highlightBlock(block)
  })
})

export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
}) => {
  Vue.use(ElementUI);
  // ...做一些其他的应用级别的优化
}