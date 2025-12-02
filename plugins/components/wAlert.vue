<script>
/*
<w-alert
  type="primary"
  icon="el-icon-warning"
  title="提示：可只设置每班总人数，男生、女生人数可不设置"
/>
*/
/**
 * update: 2024-05-10 新增type=light属性
 */
export default {
  render() {
    const on = {
      ...this.$listeners
    }
    const props = {
      closable: false,
      className: [],
      ...this.$attrs,
      ...this.$props,
    }
    return <el-alert class={['w-alert', props.type]} on={on} props={{ ...props, title: '' }}>
      {[
        this.isShowIcon(props),
        <span>{props.title || this.$slots.default}</span>,
        <span class="right_text">{props.rightText}</span>
      ]}
    </el-alert>
  },
  methods: {
    isShowIcon(props) {
      if (props.icon) {
        return <i class={[props.icon, 'icon']} />
      }
    }
  }
}
</script>
