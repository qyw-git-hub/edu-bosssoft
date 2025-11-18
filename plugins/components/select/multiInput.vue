<template>
  <!-- 身份证-证件号码多选查询 -->
  <div class="idcard_list_search_wrapper">
    <div v-show="visible" class="card_select_masks" @click.stop="isShowPop"></div>
    <el-popover v-model="visible" v-bind="popoverAttrs">
      <div>
        <el-input v-bind="textareaAttrs" v-model="inputValue" />
      </div>
      <el-select
        v-bind="selectAttrs"
        v-model="selection"
        slot="reference"
        ref="cardSelect"
        popper-class="idcard_list_search_select"
        :popper-append-to-body="false"
        :style="{ width: selectAttrs.width }"
        :class="[!selectAttrs['collapse-tags'] ? 'idcard_no_collapse_tags' : '']"
        @remove-tag="removeTagSingle"
        @clear="clearTag"
      >
        <el-option
          v-for="(item, index) in selectOptionList"
          :key="`${item.value}-${index}`"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'multiInput',
  model: {
    prop: 'parentOptions',
    event: 'change'
  },
  props: {
    // 父级绑定值
    parentOptions: {
      type: [Array, String],
      default: () => ([]),
    },
    parentVisible: {
      type: Boolean,
      default: false,
    },
    // popover数据
    popoverParams: {
      type: Object,
      default: () => ({})
    },
    // 输入的文本域内容
    textareaParams: {
      type: Object,
      default: () => ({})
    },
    // 展示的下拉框
    selectParams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      inputValue: '',
      selectOptionList: [],
    }
  },
  watch: {
    // 初始化证件号码数据
    parentOptions: {
      handler(val) {
        this.inputValue = ''
        if (val && Array.isArray(val) && val.length) {
          this.inputValue = val.join('\n')
        }
        this.changeInputValue(this.inputValue)
      },
      deep: true,
      immediate: true,
    },
    // 输入改变
    inputValue(val) {
      this.changeInputValue(val)
      this.$emit('getInputStr', val)
    }
  },
  computed: {
    popoverAttrs() {
      return {
        ...this.popoverParams,
      }
    },
    textareaAttrs() {
      return {
        placeholder: '每行一个，回车创建',
        rows: 5,
        type: 'textarea',
        ...this.textareaParams,
      }
    },
    selectAttrs() {
      return {
        placeholder: '请在下方文本框输入',
        multiple: true,
        clearable: true,
        size: 'small',
        width: '100%',
        'collapse-tags': true,
        ...this.selectParams,
      }
    },
    // 绑定的值
    selection: {
      get() {
        return this.selectOptionList.map(v => v.value)
      },
      set(val) {
        this.selectOptionList = val && val.length ? val.map(v => ({ label: v, value: v })) : []
      }
    }
  },
  methods: {
    isShowPop() {
      this.visible = !this.visible
      this.$emit('change', this.selection)
    },
    // inputValue(输入改变)，则改变selectOptionList和selection，
    changeInputValue(val) {
      if (!val) {
        this.selectOptionList = []
        return
      }
      const selectArr = val.split('\n')
      if (selectArr.length > 1) {
        this.selectOptionList = selectArr.filter(v => v).map(v => ({ label: v, value: v }))
      } else {
        this.selectOptionList = [{ label: val, value: val }]
      }
    },
    // 单个移除
    removeTagSingle() {
      this.inputValue = this.selectOptionList.map(v => v.value).join('\n')
      this.$emit('change', this.selection)
    },
    // 清空
    clearTag() {
      this.inputValue = ''
      this.$emit('change', this.selection)
    },
  }
}
</script>
