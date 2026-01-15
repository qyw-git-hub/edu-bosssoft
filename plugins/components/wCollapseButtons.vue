<script>
import { removalRepeat } from '../utils/common'
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
    let btnList = []
    const els = document.querySelectorAll(`.wCollapseButtonList${this.index} .el-button`)
    this.btnEls = els || []
    els.forEach((el, i) => {
      btnList[i] = { label: el.innerText, disabled: el.disabled }
    })
    //去重处理，避免合并单元格出现多个情况
    btnList = removalRepeat(btnList, 'label').list
    return [<div class="inline_block wCollapseButtons">
      <div class={['wCollapseButtonList', 'wCollapseButtonList' + this.index]}>
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