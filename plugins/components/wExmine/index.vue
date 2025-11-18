<template>
  <div class="wExmine timeline">
    <el-timeline v-if="data.length>0">
      <el-timeline-item
        v-for="(item, index) in data"
        :key="index"
        :timestamp="item[defineProps.options||'options'] || '无'"
        :class="[
          'timeline_' + [statusData[item[defineProps.status]].color],
          !item[defineProps.options || 'options'] && (index === data.length - 1 || index === 0) ? 'disabled_is_bottom' : ''
        ]"
      >
        <span class="date">{{ item[defineProps.time || 'time'] }}</span>
        <span
          v-show="item[defineProps.operator]"
        >{{ defineProps.operateTitle || '操作人' }}：{{ item[defineProps.operator] }}&emsp;</span>
        {{ item[defineProps.title||'title'] }}
        <span
          v-if="statusData[item[defineProps.status]].label"
        >（{{statusData[item[defineProps.status]].label+(item[defineProps.user]?'：'+item[defineProps.user]:'')}}）</span>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-else :image-size="100" :description="params.emptyText || '暂无审核信息'"></el-empty>
  </div>
</template>

<script>
export default {
  props: {
    params: {
      type: Object,
      default: () => { }
    },
  },
  data() {
    return {
      data: [],
      defineProps: {},
      statusData: {}
    }
  },
  computed: {
    info() {
      return this.params
    }
  },
  watch: {
    info: {
      handler(value) {
        const { defineProps, data, statusData } = value
        this.defineProps = defineProps
        this.data = data || []
        this.statusData = statusData
      },
      deep: true
    }
  }
}
</script>
