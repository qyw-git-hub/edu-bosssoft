<script>
export default {
  props: {
    index: {
      type: [Number, String],
      default: 0
    },
    border: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      btnEls: [],
    }
  },
  render() {
    const btnList = []
    const els = document.querySelectorAll(`.wTableMoreBtns${this.index} .el-button`)
    this.btnEls = els || []
    els.forEach((el, i) => {
      btnList[i] = { label: el.innerText, disabled: el.disabled }
    })
    return [<div class="inline_block wTableMoreBtn">
      <div class={['wTableMoreBtns', 'wTableMoreBtns' + this.index]}>
        {this.$slots.default}
      </div>
      <el-dropdown props={this.$attrs} placement="bottom-start" on={{
        command: this.onCommand
      }} >
        <w-button
          class={['btn', this.border && 'more_btn_border']}
          limit="table-btn"
          type="primary"
        >更多操作<i class="el-icon-arrow-down ml3" /></w-button>
        <el-dropdown-menu slot="dropdown">
          {btnList.map((item, i) => <el-dropdown-item command={i} disabled={item.disabled}>{item.label}</el-dropdown-item>)}
        </el-dropdown-menu>
      </el-dropdown>
    </div>]
  },
  methods: {
    onCommand(command) {
      this.btnEls[command].click()
    }
  }
}
</script>