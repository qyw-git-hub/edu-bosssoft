/**
 * update: 2023-08-18 扩展limit属性，扩展一个配置项moreForm，当表单超出2行的情况下自动显示<更多搜索>按钮，
 * 使用参考`report/fundClassificationDetails`文件，需配合el-form表单，button插槽使用
 * 搜索条件表单中默认固定一行4个格子，超出则换行，若当前输入框需要占2-4个格子，则在<el-form-item>标签中传入grid="2|3|4"
 * 当搜索栏不固定4个格子，就传入row="3|5|6"，根据实际应用扩展，将对应grid补齐
 *
 * update: 2024-04-08 基于"limit=moreform"扩展extendsParams参数，用于存放额外绑定参数，
 * 如hideOverflow:false，默认开启，为true时表示超出显示省略号
 *
 * update: 2023-08-31 基于 limit="moreForm" 作出默认搜索插槽扩展，抛出 search 和 reset 方法
 *
 * update: 2021-3-1 基于limit="moreForm"，新增searchParams参数，生成动态查询，使用此参数时不传递默认插槽
 * 使用参考：学生信息管理
 */
export default {
  name: 'wPanelItem',
  props: {
    border: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    inline: { type: Boolean, default: false },
    permission: { type: String, default: '' }, //权限名称，直接传进来
    className: { type: String, default: '' }, //inSearch: 在搜索区域的样式
    extendsParams: { type: Object, default: () => ({}) },
    limit: { type: String, default: '' },
    searchParams: { type: Object, default: () => ({}) },
    searchLimit: { //自定义搜索样式
      type: Object,
      default: () => {
        return { search: {}, refresh: {} }
      }
    },
  },
  data() {
    return {
      slotbutton: { text: '展开更多搜索', visible: false, isOpen: false },
      formItemCount: 0
    };
  },
  computed: {
    moreFormGoods() {
      return this.$refs.moreFormGoods
    }
  },
  methods: {
    initRender(limit) {
      const { className = '', methods, extendSlot, component, name, el } = limit
      const eles = this.className ? `.${this.className} .el-form` : this.inline ? '.wPanelItemInline .el-form' : el
      methods && this[methods](eles);
      return [
        <div
          class={[
            'wPanelItem',
            this.className,
            this.inline ? 'wPanelItemInline' : '',
            this.border ? 'border_bottom' : '',
            className
          ]}
          v-loading={this.loading}
          element-loading-spinner="el-icon-loading"
        >
          {this.$slots.default}
          {component && component()}
          {extendSlot && this.extendSlot(extendSlot, name, eles)}
        </div>
      ]
    },
    extendSlot(extendSlot, name, els) {
      const getDefaultButton = () => {
        if (!this.$slots.button) {
          return (
            <div>
              <w-button
                limit="search"
                attrs={this.searchLimit['search']}
                on={{
                  click: event => this.handleAction('search', event, extendSlot)
                }}
              />
              <w-button
                limit="refresh"
                attrs={this.searchLimit['refresh']}
                on={{
                  click: event => this.handleAction('reset', event, extendSlot)
                }}
              />
            </div>
          );
        }
        return <div>{this.$slots.button}</div>;
      };
      return {
        button: (
          <p class={'slot' + extendSlot}>
            {getDefaultButton()}
            <p
              class={['link_text', this.slotbutton.visible ? 'link_text_show' : 'link_text_hide']}
              on={{
                click: () => {
                  this.slotbutton.isOpen = !this.slotbutton.isOpen;
                  const el = document.querySelector(els);
                  if (this.slotbutton.isOpen) {
                    el.style.height = el.scrollHeight + 'px';
                    el.style['overflow-y'] = 'scroll';
                    this.slotbutton.text = '收起更多搜索';
                  } else {
                    el.scrollTop = 0;
                    el.style.height = '78px';
                    el.style['overflow-y'] = 'hidden';
                    this.slotbutton.text = '展开更多搜索';
                  }
                }
              }}
            >
              {this.slotbutton.text}
              <i
                class="el-icon-arrow-down"
                style={`transform: ${this.slotbutton.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`}
              />
            </p>
          </p>
        )
      }[extendSlot];
    },
    moreForm(els) {
      this.$nextTick(() => {
        let el = document.querySelector(els);
        if (el && el.children) {
          let count = 0;
          let row = 4;
          for (let i = 0; i < el.children.length; i++) {
            const e = el.children[i];
            if (e.attributes.row) {
              row = e.attributes.row.value;
            }
            if (e.attributes.grid) { /* 正常绑定grid属性 */
              count += Number(e.attributes.grid.value);
            } else {
              if (/el-col-(12|18|24)/g.test(e.className)) {/* 通过筛选表头设置情况 */
                const num = e.className.split('el-col-')[1]
                count += Number(num / 6);
              } else {
                count += 1;
              }
            }
          }
          if (this.formItemCount != count) {
            this.formItemCount = count;
            el.scrollTop = 0;
            el.style.height = '34px';
            el.style['overflow-y'] = 'hidden';
            this.slotbutton.text = '展开更多搜索';
            this.slotbutton.visible = false;
            this.slotbutton.isOpen = false;
            if (count > row) {
              el.style.height = '78px';
              if (count > row * 2) {
                this.slotbutton.visible = true;
              }
            }
          }
        }
      });
    },

    handleAction(actionType, event = null, extendSlot = undefined) {
      const ref = this.$refs[this.limit]; //动态表单
      switch (this.limit) {
        case 'moreFormStudent': //学生
          {
            const params = ref ? (actionType == 'search' ? ref.getSearchParams() : ref.getResetParams()) : {};
            this.$emit(actionType, { event, state: extendSlot, params, actionType });
          }
          break;
        case 'moreFormGoods': // 商品
          actionType == 'reset' && ref.fApi.resetFields();
          ref.fApi.submit(params => {
            this.$emit(actionType, { event, state: extendSlot, params, actionType });
          });
          break;
        default:
          this.$emit(actionType, { event, state: extendSlot, actionType });
          break;
      }
    }
  }
};
