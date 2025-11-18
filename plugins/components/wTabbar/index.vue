<template>
  <!-- 
    用法:
    <w-tabbar v-model="value" :data="data" /> 
  -->
  <ul class="flex w_tabbar">
    <li
      :class="currentIndex == i && 'active'"
      v-for="(item,i) in data"
      :key="i"
      @click="onClick(item,i)"
    >
      <p v-if="i==0" class="active_bg" :style="{transform: `translateX(${currentIndex*100}%)`}"></p>
      <span class="label">{{item[mapping.label]}}</span>
    </li>
  </ul>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    data: {
      type: Array,
      default: () => []
    },
    mapping: {
      type: Object,
      default: () => {
        return {
          value: 'value',
          label: 'label'
        }
      }
    }
  },
  data() {
    return {
      currentIndex: 0
    }
  },
  computed: {
    currentValue: {
      set(val) {
        this.$emit('change', val)
      },
      get() {
        return this.value
      }
    }
  },
  watch: {
    currentValue(val) {
      const index = this.data.findIndex(f => f[this.mapping.value] == val)
      this.currentIndex = index == -1 ? 0 : index
    }
  },
  methods: {
    onClick(item, i) {
      this.currentValue = item[this.mapping.value]
      this.currentIndex = i
    }
  }
}
</script>
