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
    },
  },
  data() {
    return {
      btnEls: []
    };
  },
  render() {
    let btnList = [];
    const els = document.querySelectorAll(`.wCollapseButtonList${this.index} .el-button`);

    this.btnEls = els || [];
    els.forEach((el, i) => {
      btnList[i] = { label: el.innerText, disabled: el.disabled, index: i };
    });

    // 去重处理，避免合并单元格出现多个情况
    btnList = removalRepeat(btnList, 'label').list.filter((item, i) => i != 0);

    // 获取插槽数量设置显示内容
    const btnSlotsEls = [];
    const btnSlots = this.$slots.default || [];
    for (let i = 0; i < btnSlots.length; i++) {
      const e = btnSlots[i];
      if (e.tag && e.tag.includes('wButton')) {
        btnSlotsEls.push(e);
      }
    }

    /* 当都没有按钮时，不显示 */
    if (!btnSlotsEls.length) {
      return '';
    }

    return [
      <div class="inline_block wCollapseButtons">
        <div class={['inline_block', 'wCollapseButtonList' + this.index]}>{
          btnSlotsEls.map((item, i) => {
            return <span class={btnSlotsEls.length > 2 && i != 0 ? 'wCollapseButtonHidden' : ''}>{item}</span>
          })
        }</div>
        {btnSlotsEls.length > 2 ? (
          <el-dropdown
            props={this.$attrs}
            placement="bottom-start"
            on={{
              command: this.onCommand
            }}
          >
            <w-button class={['btn', this.border && 'more_btn_border']} limit="table-btn" type="primary">
              更多操作
              <i class="el-icon-arrow-down ml3" />
            </w-button>
            <el-dropdown-menu slot="dropdown">
              {btnList.map(item => (
                <el-dropdown-item command={item.index} disabled={item.disabled}>
                  {item.label}
                </el-dropdown-item>
              ))}
            </el-dropdown-menu>
          </el-dropdown>
        ) : (
          ''
        )}
      </div>
    ];
  },
  methods: {
    onCommand(command) {
      this.btnEls[command].click();
    }
  }
};
</script>