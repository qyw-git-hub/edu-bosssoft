<template>
  <div class="w-step">
    <ul class="ul">
      <li
        class="li"
        :class="{ 
          active: params.isCloseBeforeActive ? index == curIndex : index <= curIndex, 
          activeCurrent:index == curIndex, 'pointer': params.click 
        }"
        v-for="(item, index) in params.data"
        :key="index"
        @click="onClick({item,index})"
      >
        <div class="num" :style="{ width: params.width+'px' }">
          <p>
            <span>{{ index + 1 }}</span>
          </p>
          <p class="ellipsis2">{{ item }}</p>
        </div>
        <div
          class="line"
          v-if="index != params.data.length-1"
          :style="{ left: (params.width - 38) + 'px', width: (params.width + 40) + 'px' }"
        ></div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    params: {
      type: Object,
      default: () => {
        return {
          index: 0,
          click: false,
          isCloseBeforeActive: false,
          width: 90,
          data: []
        }
      }
    }
  },
  watch: {
    'params.index'(value) {
      this.curIndex = value < 0 ? value > this.params.data.length - 1 : value
    }
  },
  data() {
    return {
      curIndex: this.params.index || 0
    }
  },
  methods: {
    onClick(item) {
      this.$emit('click', item)
    },
  },
}
</script>
