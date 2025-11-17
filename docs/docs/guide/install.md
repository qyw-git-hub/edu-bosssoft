# 安装

### 使用npm安装
通过 npm 安装可以更好地与现代构建工具（如 Webpack）集成。

```bash
npm install bosssoft-edu
```

### 安装后的初始配置
安装后需要在项目的入口文件（如 `main.js`）中引入组件库的样式文件。在此之前需要引入element-ui依赖，该组件库依赖于element-ui。

#### 引入和全局注册
```javascript
import 'bosssoft-edu/plugins/styles/theme/index.css';
import "bosssoft-edu/plugins/styles/component.scss"
import BosssoftEdu from 'bosssoft-edu';
Vue.use(BosssoftEdu);
```

#### 在组件中使用
```javascript
<template>
  <wTreeSelectMult v-model="deptIds" :data="deptList" />
</template>

<script>
import { wTreeSelectMult } from 'bosssoft-edu'
export default {
  components: {
    wTreeSelectMult
  },
  data() {
    return {
      deptIds: [],
      deptList: []
    }
  }
}
</script>
```