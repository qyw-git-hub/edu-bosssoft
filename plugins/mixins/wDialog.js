import { randomString } from '../utils/common.js';
export default {
  model: {
    prop: 'api',
    event: 'change'
  },
  props: {
    api: {
      type: Object,
      default: () => { }
    },
    visible: {
      type: Boolean,
      default: false
    },
    params: {
      type: Object,
      default: () => { }
    },
    form: {
      type: Object,
      default: () => { }
    },
    rule: {
      type: [Object, Array],
      default: () => []
    },
    value: {
      type: Object,
      default: () => { }
    },
    option: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      fApi: {},
    }
  },
  computed: {
    isOpen: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    },
    values: {
      get() {
        return this.value
      },
      set(value) {
        this.$emit('update:value', value)
      },
    },
    dialogAttrs() {
      return {
        'close-on-click-modal': false,
        ...this.params,
        title: this.params.title || '未设置标题',
        width: this.params.width || '768px',
        hiddenFooter: this.params.hiddenFooter || false,
      }
    },
    getOptions() {
      let option = {
        submitBtn: false,
        row: { gutter: 12 },
        col: { span: 12 },
        form: {
          labelPosition: 'right',
          labelWidth: '90px',
          size: 'small',
        },
      }
      let formOptions = this.option || {}
      for (const key in formOptions) {
        const e = formOptions[key];
        if (e) {
          option[key] = e
        }
      }
      return option
    },
  },
  watch: {
    fApi: {/* 监听fApi方法 */
      handler(value) {
        this.$emit('change', value)
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    randomString,
    onClose() {
      this.$el.querySelector('.el-dialog__body').scrollTop = 0
    },
    onSubmit() {
      this.$emit('submit', this.fApi)
    },
    onCancel() {
      this.isOpen = false
    }
  }
}