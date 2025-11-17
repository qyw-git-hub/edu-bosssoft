<template>
  <div class="wPanel">
    <p>常用的面板容器，搭配wPanelItem组件使用，建议注册到全局。</p>
    <h3>基础用法</h3>
    <p>自适应智付校园内容高度。</p>
    <div class="component-wrapper">
      <div class="component-wrapper-demo">
        <el-card class="box-card">
          <div v-for="o in 4" :key="o" class="text item">{{'列表内容 ' + o }}</div>
        </el-card>
      </div>
      <div class="code-content" v-highlight style="height: 0;">
        <div class="code-content-height">
          <pre><code class="html">{{codeStr}}</code></pre>
        </div>
      </div>
      <div class="lock-code" @click="showCode(0)">
        <i
          class="icon-down"
          :class="isShow[0] === false ? 'el-icon-caret-bottom' : 'el-icon-caret-top'"
        ></i>
        <span class="lock-code-word">{{isShow[0] === false ? '显示代码' : '隐藏代码'}}</span>
      </div>
    </div>

    <h3 class="mt50">Attributes</h3>
    <table class="table">
      <tr>
        <th v-for="h in columns" :key="h.prop" :style="{width: h.width + 'px'}">{{h.label}}</th>
      </tr>
      <tr v-for="(d,j) in tableData" :key="j">
        <td>{{d.attributes}}</td>
        <td v-html="d.desc"></td>
        <td>{{d.type}}</td>
        <td>{{d.value}}</td>
        <td>{{d.defaultValue}}</td>
      </tr>
    </table>
    <h3 class="mt50">Params Attributes</h3>
    <p>部分参数展示</p>
    <table class="table">
      <tr>
        <th v-for="h in columns" :key="h.prop" :style="{width: h.width + 'px'}">{{h.label}}</th>
      </tr>
      <tr v-for="(d,j) in panelTableData" :key="j">
        <td>{{d.attributes}}</td>
        <td v-html="d.desc"></td>
        <td>{{d.type}}</td>
        <td>{{d.value}}</td>
        <td>{{d.defaultValue}}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import mixin from '../mixin'
export default {
  name: 'wPanel',
  mixins: [mixin],
  data() {
    return {
      codeStr: `
<w-panel :params="false" :pagination="false">
  <div v-for="o in 4" :key="o" class="text item">{{'列表内容 ' + o }}</div>
</w-panel>
        `.replace(/^\s*/, '').trim(),
      tableData: [
        {
          attributes: 'loading',
          desc: '面板加载',
          type: 'Boolean',
          value: 'true / false',
          defaultValue: 'false',
        },
        {
          attributes: 'disHeight',
          desc: '差值高',
          type: 'Number',
          value: '-',
          defaultValue: '0',
        },
        {
          attributes: 'params',
          desc: '无需表格传递false，详细传参参照vxe官方文档，<a href="https://vxetable.cn/v3/#/grid/api?apiKey=grid" target="_blank">点击跳转</a>',
          type: 'Object, Boolean',
          value: '-',
          defaultValue: '{}',
        },
        {
          attributes: 'pagination',
          desc: '无需页码传递false，详细传参参照element-ui页码官方文档，<a href="https://element.eleme.cn/#/zh-CN/component/pagination" target="_blank">点击跳转</a>',
          type: 'Object, Boolean',
          value: '-',
          defaultValue: `{ page: 1, limit: 10, total: 0 }`,
        },
        {
          attributes: 'tabbar',
          desc: '默认false，详细传参参照element-ui标签官方文档，<a href="https://element.eleme.cn/#/zh-CN/component/tabs" target="_blank">点击跳转</a>',
          type: 'Object, Boolean',
          value: '-',
          defaultValue: `{ value: undefined, data: [], on: {} }`,
        },
        {
          attributes: 'inline',
          desc: '当出现内外层都有w-panel，例如tab页签情况，在内层加上inline参数可适配',
          type: 'Boolean',
          value: 'true / false',
          defaultValue: `false`,
        },
        {
          attributes: 'leftTreeParams',
          desc: '是否增加左侧树内容',
          type: 'Object, Boolean',
          value: '-',
          defaultValue: `false`,
        },
      ],
      columns: [
        { prop: 'attributes', label: '参数' },
        { prop: 'desc', label: '说明', width: 180 },
        { prop: 'type', label: '类型' },
        { prop: 'value', label: '可选值' },
        { prop: 'defaultValue', label: '默认值', width: 120 },
      ],
      panelTableData:[
        {
          attributes: 'params',
          desc: '',
          type: '',
          value: '-',
          defaultValue: '',
        },
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
</style>