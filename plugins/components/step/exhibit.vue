<template>
  <div class="w-step-exhibit">
    <ul class="ul" :style="{'padding-left': data.length > 1 ? width + 'px' : ''}">
      <li class="li" v-for="(item, index) in data" :key="index">
        <p class="circle"></p>
        <div class="line" :style="{opacity: index != data.length-1 ? 1 : 0, width: width + 'px'}"></div>
        <p class="title ellipsis2">{{ item }}</p>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    width: {
      type: Number,
      default: 130
    },
    data: {
      type: Array,
      default: () => []
    },
  },
}
</script>