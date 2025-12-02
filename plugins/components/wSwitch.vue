<script>
export default {
  props: {
    'active-text': {
      type: String,
      default: '启用'
    },
    'inactive-text': {
      type: String,
      default: '禁用'
    },
    limit: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'middle'
    },
    hideActiveText: Boolean,
    hideInactiveText: Boolean,
  },
  render() {
    const on = {
      ...this.$listeners
    }
    const props = {
      ...this.$attrs,
      ...this.$props
    }
    props['active-text'] = this.hideActiveText ? '' : this['active-text']
    props['inactive-text'] = this.hideInactiveText ? '' : this['inactive-text']
    const limitValue = {
      'out': 'w-switch-out',
    }
    return (
      <span>
        <el-switch
          class={[limitValue[this.limit] || 'w-switch', `w-switch-${this.size}`]}
          active-color={"#4254FF"}
          on={on}
          props={props}
        >
        </el-switch>
      </span>
    )
  }
}
</script>

