<template>
  <div class="w-step-exmine">
    <ul class="ul">
      <li
        class="li"
        :class="{active:index <= curIndex, activeCurrent:index == curIndex, 'pointer':params.click}"
        v-for="(item, index) in params.data"
        :key="index"
        @click="onClick({item,index})"
      >
        <div class="num">
          <p :class="item.type">
            <span class="w_step_type">{{ index + 1 }}</span>
          </p>
          <p class="title ellipsis2" :class="index == curIndex ? item.type : 'primary' ">{{ item.label }}</p>
          <p class="desc" v-show="item.desc" v-html="item.desc"></p>
        </div>
        <div class="line" v-if="index != params.data.length-1"></div>
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
          value: '',
          click: false,
          data: []
        }
      }
    }
  },
  computed: {
    curIndex() {
      const value = this.params.value
      return this.params.data.findIndex(f => f.value == value) || 0
    }
  },
  methods: {
    onClick(item) {
      this.$emit('click', item)
    },
  },
}
</script>