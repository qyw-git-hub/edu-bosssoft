<template>
  <div>
    <el-timeline v-if="getParams.data.length>0" class="timeline__with__process">
      <el-timeline-item
        v-for="(item, index) in getParams.data"
        :key="index"
        :timestamp="item[getParams.defineProps.time]"
        :class="['timeline_item', `timeline_${getClass(item).color}`, Number(disabledIndex) && index > disabledIndex && 'timeline_disabled']"
      >
        <div class="process_title">{{ item[getParams.defineProps.title] }}</div>
        <div
          v-if="item[getParams.defineProps.operateUserName]"
          class="operator"
          v-html="`${item[getParams.defineProps.operateUserTitle] || '操作人'}：${item[getParams.defineProps.operateUserName]}`"
        />
        <div
          v-if="item[getParams.defineProps.remark]"
          :class="['remark', getClass(item).color]"
        >
        <p>{{ getParams.defineProps.remarkTitle }}{{ item[getParams.defineProps.remark] }}</p>
        <slot name="remark" :item="item"></slot>
        </div>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-else :image-size="100" :description="getParams.emptyText || '暂无审核信息'" />
  </div>
</template>

<script>
// 时间线的内容由传入的 data 定义
export default {
  props: {
    // 是否展示默认的点（不需要使用状态来判断颜色等）
    defaultDot: {
      type: Boolean,
      default: false,
    },
    disabledIndex: {
      type: Number,
      default: null,
    },
    params: {
      type: Object,
      default: () => ({
        data: [],
        defineProps: {
          time: 'time', // 时间线的时间显示
          title: 'title', // 主要的标题显示
          operateUserName: 'operateUserName', // 操作人
          status: 'status', // 状态的键
          remark: 'remark', // 备注
          remarkTitle: 'remarkTitle', // 备注的字段
          operateUserTitle: 'operateUserTitle', // 操作人显示标题
        },
        statusData: {
          '1': { label: '通过', color: 'green' },
          '3': { label: '驳回', color: 'red' },
          '2': { label: '提交', color: 'primary' },
        }
      })
    }
  },
  data() {
    return {}
  },
  computed: {
    // 获取传过来的参数
    getParams() {
      return {
        data: this.params.data || [],
        defineProps: {
          time: 'time', // 时间线的时间显示
          title: 'title', // 主要的标题显示
          operateUserName: 'operateUserName', // 操作人
          remark: 'remark', // 备注
          status: 'status', // 状态的键
          operateUserTitle: 'operateUserTitle', // 操作人显示标题
          ...this.params.defineProps
        },
        // 状态
        statusData: {
          '1': { label: '通过', color: 'green' },
          '3': { label: '驳回', color: 'red' },
          '0': { label: '提交', color: '#E6A23C' },
          ...this.params.statusData
        },
        emptyText: this.params.emptyText || '暂无审核记录'
      }
    },
    // 获取item对应的class
    getClass() {
      return (item) => {
        return !this.defaultDot ? this.getParams.statusData[item[this.getParams.defineProps.status]] : { color: '' }
      }
    },
  },
  methods: {}
}
</script>
