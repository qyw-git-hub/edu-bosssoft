<template>
  <div :class="['wTitle', borderLeft&&'borderLeft', limit]" :style="{fontSize:fontSize+'px'}">
    <slot></slot>
    <p class="line" v-if="border" :style="{background:lineColor}"></p>
  </div>
</template>

<script>
export default {
  props: {
    fontSize: {
      type: [String, Number],
      default: 16
    },
    borderLeft: {
      type: Boolean,
      default: true
    },
    border: {
      type: Boolean,
      default: false
    },
    lineColor: {
      type: String,
      default: ''
    },
    limit: { // subTitle
      type: String,
      default: ''
    }
  },
}
</script>