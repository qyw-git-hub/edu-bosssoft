/**
 * update 2022-10-14
 * resizeTable: true, 手动开启，开启后使用flex1方式且高度为100%, 为false的时候高度为auto，高度值为vxe-table自动计算。
 *
 * update 2022-11-14
 * 新增left插槽，可实现左树右表格结构
 *
 * update 2022-11-29
 * 新增loading参数，传入loading可使panel区域出现加载圈
 * 新增tabbar插槽内容
 *
 * update 2024-05-16
 * 由于升级表格表头跟随内容对齐，将表头对齐默认设置为`justify-content: center`，需要单独对某个表头修改对齐，需要在columns里面传递`headerAlign:'right'`
 *
 * update 2024-09-04
 * 根据需求要求，新增左边班级树样式，数据传递方式 leftTreeParams: { data: [], porps: {} }
 *
 * update 2023-09-07
 * 修改 doLayout 函数，传参index为页面上需要调整高度的w-panel的index
 * 适用于同一个页面上有多个w-panel的情况页面高度获取不正确的问题
 * update 2024-01-08
 * 增加生命周期 activated 执行 doLayout 方法，解决银行账户审核等切换导航时表格高度问题（会出现竖向滚动条）
 * update 2024-02-22
 *    增加表格默认参数 `showHeaderOverflow`，表格头部超出自动省略号
 */
import { isObjectNotEmpty, restoreSummaryFormatting, copyText } from '../utils/common.js';
export default {
  components: {
    MultipleLeft: () => import('../components/wTreeSelect/multipleLeft.vue'),
    SingleLeft: () => import('../components/wTreeSelect/singleLeft.vue'),
  },
  props: {
    loading: Boolean,
    leftTreeParams: [Boolean, Object],
    /* 差值高 */
    disHeight: {
      type: Number,
      default: 0
    },
    params: [Object, Boolean] /* 详细传参参照vxe官方文档，https://vxetable.cn/v3/#/table/grid/basic */,
    pagination: {
      /* 详细传参参照element-ui的pagination分页组件 */
      type: [Object, Boolean],
      default: () => {
        return {
          page: 1 /* 页码 */,
          limit: 10 /* 页码数 */,
          total: 0 /* 总数 */
        };
      }
    },
    tabBar: {
      type: [Object, Boolean],
      default: () => {
        return {
          value: undefined,
          data: [],
          on: {}
        };
      }
    },
    /* 页脚下拉框 */
    footerSelection: [Object, Boolean],
    /* 当出现内外层都有w-panel，例如tab页签情况，在内层加上inline参数可适配 */
    inline: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      navT: localStorage.getItem('themeType'),
      tableOption: {
        load: false,
        height: 'auto',
        scrollY: { enabled: true, virtual: true, gt: 10, oSize: 50 },
        showHeaderOverflow: true,
        isTablePage: true,
        rowConfig: {},
        tooltipConfig: {
          theme: 'dark'
        },
        'highlight-current-row': true,
        'header-cell-style': { align: 'center' },
        'footer-cell-style': { cursor: 'default' },
        headerAlign: 'center',
        border: true,
        round: true,
        size: 'small',
        resizable: true,
        showOverflow: true,
        showFooterOverflow: true,
        align: 'center',
        columns: [],
        data: [],
        tabIndex: '0',
        zIndex: 1100,
        leftPanelWidth: '0px', //左侧面板宽度
      },
      isShowLeftTree: true,
      leftPanelScreenX: '',
      /**
       * params.leftPanelWidth 是左侧插槽容器的宽度
       * leftTreeParams.width 左侧树宽度
       * leftTreeWidth 继承了左侧树的宽度，做拖拽宽度
       */
      leftTreeWidth: (this.leftTreeParams || {}).width || 276, // 左侧树默认宽度
    };
  },
  created() {
    /* 判断是否开启左侧树 */
    if (this.leftTreeParams && this.leftTreeParams.isDrag) {
      /* 开启全局鼠标抬起事件 */
      document.addEventListener("mouseup", () => {
        this.leftPanelScreenX = ''
        this.$set(this.leftTreeParams, 'isDragActive', false)
        document.removeEventListener("mousemove", this.onLeftPanelMouseMove);
        if (this.leftTreeWidth < 100) {
          this.isShowLeftTree = false
          this.leftTreeParams.isExpand && this.leftTreeParams.isExpand(this.isShowLeftTree)
        }
      });
    }
  },
  beforeDestroy() {
    /* 判断是否开启左侧树 */
    if (this.leftTreeParams && this.leftTreeParams.isDrag) {
      document.removeEventListener("mouseup", this.onLeftPanelMouseMove);
    }
  },
  render() {
    const isLeftTreeHidden = Boolean(this.$slots.leftPanel || (this.leftTreeParams && !this.leftTreeParams.hidden));
    return (
      <div
        v-loading={this.loading}
        element-loading-text="正在加载中，请稍后..."
        element-loading-spinner="el-icon-loading"
        class={['wContentPanel', isLeftTreeHidden && 'wContentPanelLeft', this.inline && 'wContentPanelInline']}
        id="wContentPanel"
        style={
          this.inline ?
            {} :
            {
              height: this.navT == '0' ? `calc(100vh - 110px - ${this.disHeight}px)` : `calc(100vh - 90px - ${this.disHeight}px)`,
              'overflow-y': this.params.resizeTable ? 'hidden' : 'auto'
            }
        }
      >
        {this.containerSlots()}
      </div>
    );
  },
  computed: {
    wTable() {
      return this.$refs.wTable;
    },
    filterHeaders() {
      return this.$refs.filterHeaders;
    }
  },
  watch: {
    'params.clearRadioRow'(value) {
      if (value) {
        this.$refs.wTable.clearRadioRow();
        this.params.clearRadioRow = false;
      }
    }
  },
  methods: {
    containerSlots() {
      /* 判断是否有左侧leftTable插槽 */
      const haveLeftTable = () => {
        const { leftPanelWidth } = this.params || {}
        const returnTable = [
          /* 标准表格+页脚+页码 */ this.$slots.headerTable,
          this.tableBox(),
          this.$slots.footer,
          this.paginationBox()
        ];
        if (this.$slots.leftTable) {
          /* 表格左侧占位 + 标准表格+页脚+页码 */
          return (
            <div class="flexs flex1">
              {this.$slots.leftTable}
              <div class="flex1 flexs flex_column rightContent"
                style={{
                  width: leftPanelWidth ? `calc(100% - ${leftPanelWidth})` : 'auto'
                }}>
                {this.$slots.rightContent || [this.$slots.rightTable, returnTable]}
              </div>
            </div>
          );
        }
        return returnTable;
      };

      /* 默认显示表格样式 */
      const slotsMethod = () => {
        return [
          this.$slots.headers, /* 头部占位 */
          this.tabsBox(), /* 页签占位 */
          this.$slots.default,/* 默认插槽占位 */
          Boolean(this.params.filterHeaders) && this.setFilterHeaders(this.params), /* 筛选表头 */
          haveLeftTable(),
          this.$slots.footerFixed ? [<div class="footer_fixed_over" />, <div class="footer_fixed">{this.$slots.footerFixed}</div>] : ''
        ]
      }

      if (Boolean(this.leftTreeParams) && isObjectNotEmpty(this.leftTreeParams)) { /* 判断是否有左侧树 */
        /* 获取左侧树参数 */
        const { hidden, width } = this.leftTreeParams || {}

        /* 左侧树插槽 */
        const leftTreeSlots = () => {
          const { hidden, loading, isSingle, isExpand, width, class: className, slots, props, filterValue, filterInfo, parentValue, data, on, isDrag, isDragActive } = this.leftTreeParams || {}
          const isShowDragLine = () => { //是否显示拖拽线
            if (isDrag) {
              return [
                <div class={['wPanelLeftPanelDragBorder', isDragActive && 'wPanelLeftPanelDragBorderActive']} on={{
                  mousedown: (e) => { //竖线拖拽事件
                    if (!this.isShowLeftTree) {
                      this.leftTreeWidth = 20
                      this.isShowLeftTree = true
                    }
                    this.$set(this.leftTreeParams, 'isDragActive', true)
                    /* 开启全局鼠标移动事件 */
                    document.addEventListener("mousemove", this.onLeftPanelMouseMove);
                    this.leftPanelScreenX = e.screenX;
                  },
                }}></div>
              ]
            }
          }
          /* 获取树类型，分单选和多选树 */
          const getTreeNode = () => {
            if (isSingle) {
              return [<SingleLeft class={['multipleLeft', 'mt12', className]}
                props={{
                  ...props,
                  value: parentValue
                }}
                data={data}
                on={on}
                scopedSlots={slots}
              >
              </SingleLeft>]
            }
            return [
              <MultipleLeft class={['multipleLeft', 'mt12', className]}
                props={{
                  ...props,
                  filterValue,
                  filterInfo,
                  parentValue
                }}
                data={data}
                on={on}
                scopedSlots={slots}
              >
                {this.$slots.leftTreeCondition}
              </MultipleLeft>
            ]
          }
          return [
            <div
              v-loading={loading}
              element-loading-spinner="el-icon-loading"
              class={['wPanelLeftPanel', !this.isShowLeftTree ? 'active' : '']}
              style={{
                display: hidden ? 'none' : 'block',
                width: !this.isShowLeftTree ? 'auto' : this.leftTreeWidth + 'px',
                'border-right': isDrag || !this.isShowLeftTree ? 'none' : '1px solid #e5e8f2',
                'border-left': isDrag || this.isShowLeftTree ? 'none' : '1px solid #e5e8f2',
              }}
            >
              <p class="multipleLeftArrowIcon"
                on={{
                  click: () => {
                    this.isShowLeftTree = !this.isShowLeftTree
                    isExpand && isExpand(this.isShowLeftTree)
                    /* 点击按钮自动恢复默认宽度 */
                    if (this.isShowLeftTree) {
                      this.leftTreeWidth = width || 276
                    }
                  }
                }}><i class="el-icon-d-arrow-left" /></p>
              {getTreeNode()}
              {isShowDragLine()}
            </div>
          ]
        }

        /* 设置右侧面板内容 */
        const rightPanelContent = () => {
          let styl = {}
          if (hidden) {
            styl = { width: '100%' }
          } else {
            if (!this.isShowLeftTree) {
              styl = { width: 'calc(100% - 45px)' }
            } else {
              styl = { width: `calc(100% - ${this.leftTreeWidth}px - 20px` }
            }
          }
          return [<div style={styl} class="wPanelRightPanel"> {slotsMethod()} </div>]
        }

        return [leftTreeSlots(), rightPanelContent()]

      } else if (Boolean(this.$slots.leftPanel)) { /* 判断是否有左侧容器 */
        const { leftPanelWidth } = this.params || {}

        return [
          <div class="leftPanel" style={{ width: (leftPanelWidth || 276) + 'px' }}>
            {this.$slots.leftPanel}
          </div>,
          <div class="wPanelRightPanel" style={{ width: `calc(100% - ${(leftPanelWidth || 276)}px - 20px` }}>
            {slotsMethod()}
          </div>
        ]
      }

      return slotsMethod();
    },

    /* 页签插槽 */
    tabsBox() {
      if (!this.tabBar) {
        return '';
      } else if (this.tabBar.data.length > 0) {
        const props = {
          ...this.tabBar,
          value: String(this.tabBar.value || this.tabBar.data[0].value)
        };
        const on = {
          ...this.tabBar.on,
          'tab-click': () => {
            if (this.tabBar.value) {
              this.tabBar.value = props.value;
            }
            if (this.tabBar.on && this.tabBar.on['tab-click']) {
              this.tabBar.value = props.value;
              this.tabBar.on['tab-click'](props.value);
            }
          }
        };
        return (
          <el-tabs class="wPanelTabs" props={props} on={on} v-model={props.value}>
            {this.tabBar.data.filter(f => Boolean(this.getAuth(f.permission))).map(m => (
              <el-tab-pane label={m.label} name={m.value}>
                {this.$slots['tab' + m.value]}
              </el-tab-pane>
            ))}
          </el-tabs>
        );
      } else if (this.tabBar.value != undefined) {
        return <span style={{ minHeight: this.tabBar.overHeight || '60px' }}></span>;
      }
    },

    /* 表格插槽 */
    tableBox() {
      if (this.$slots.table) {
        return this.$slots.table;
      } else if (this.params) {
        const on = {
          ...this.$listeners,
          'footer-cell-dblclick': this.onFooterCellDblclick
        };
        const props = {
          ...this.$attrs,
          ...this.tableOption,
          ...this.params
        };
        if (props.resizeTable) {
          props.maxHeight = this.params.maxHeight || '100%';
        } else {
          props.height = this.params.height || this.tableOption.height || 'auto';
        }
        let minHeight = this.params.minHeight
          ? { 'min-height': Number(this.params.minHeight.replace(/\D/g, '')) + 'px' }
          : { 'min-height': '200px' };
        return (
          <div
            class={[
              'flex1',
              props.resizeTable && `flexs ${this.$slots.left ? 'flex_row' : 'flex_column'}`,
              'tableContainer'
            ]}
            style={{ ...minHeight }}
          >
            {this.$slots.left}
            <vxe-grid
              v-loading={props.load_table}
              element-loading-text={props.load_text || '页面加载中，请稍后....'}
              element-loading-spinner="el-icon-loading"
              ref="wTable"
              class={['wTable', 'wTable-scrollbar', props.className, props.resizeTable ? 'resizeTable' : '']}
              on={on}
              props={props}
              scopedSlots={this.$scopedSlots}
            />
          </div>
        );
      }
    },

    /* 设置页面表头图标项 */
    setFilterHeaders({ filterHeaders: fh, rowConfig, columns, searchColumns }) {
      const props = {
        columns: columns.map(m => ({ ...m, height: rowConfig.height })) /* 表头数据 */,
        searchColumns,
        interfaceUrl: fh.interfaceUrl /* 接口地址 */,
        interfaceParams: fh.interfaceParams /* 接口参数 */,
        interfaceRequest: fh.interfaceRequest /* 请求接口request函数 */,
        defaultProps: fh.defaultProps,
        limitRuleName: fh.limitRuleName,
        rules: fh.rules,
        isAuto: fh.isAuto,
        iconInline: fh.iconInline
      };
      return <filterHeaders ref="filterHeaders" props={props} on={fh.on} />;
    },

    /* 页脚下拉框 */
    footerSelectionBox() {
      if (!this.footerSelection) {
        return ''
      }
      return [
        <div class="wFooter_selection_box">
          <span class={['mr10', 'c_394464', this.footerSelection.textClass]}>{this.footerSelection.text}</span>
          <el-select
            v-model={this.footerSelection.value}
            placeholder="请选择"
            size="small"
            popper-class="wFooter_selection_box"
            props={this.footerSelection.props}
            on={this.footerSelection.on}
          >
            {
              this.footerSelection.data.map((m, i) => (
                <el-option key={i} label={m.label} value={m.value}>
                  <p class="fw c_394464 ellipsis1">{m.label}</p>
                  <p class="f12 c_6c7da3 mt5 ellipsis1">{m.desc}</p>
                </el-option>
              ))
            }
          </el-select>
        </div>
      ]
    },

    /* 页码插槽 */
    paginationBox() {
      if (!this.pagination) {
        return ''
      }
      //切换每页条数时触发
      const sizeChange = limit => {
        this.$emit('pagination', { page: this.pagination.page, limit });
      };
      //切换页码时触发
      const currentChange = page => {
        this.$emit('pagination', { page, limit: this.pagination.limit });
      };
      //渲染分页组件
      const paginationEl = [
        this.footerSelectionBox(),
        this.$slots.pageFooter,
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          page-sizes={this.pagination.pageSizes || [10, 20, 30, 50, 100, 300, 500]}
          props={{
            ...this.pagination,
            'current-page': this.pagination.page,
            'page-size': this.pagination.limit
          }}
          on={{
            'size-change': sizeChange,
            'current-change': currentChange
          }}
        />
      ]
      return [<div class="wPanelPagination">{paginationEl}</div>]
    },
    /* 重新获取表格高度 */
    doLayout() { },

    /* 局部更新树 */
    reloadTreeExpand(row) {
      this.$refs.wTable.reloadTreeExpand(row);
    },

    /* 左侧树拖拽监听事件 */
    onLeftPanelMouseMove(event) {
      const disValue = this.leftPanelScreenX - event.screenX  /* 拖拽距离 */
      this.leftTreeWidth -= disValue
      this.leftPanelScreenX = event.screenX;
      /* 限制最大宽和最小宽 */
      if (this.leftTreeWidth < 20) {
        this.leftTreeWidth = 20
      } else if (this.leftTreeWidth > 500) {
        this.leftTreeWidth = 500
      }
    },

    /* 双击复制页脚金额 */
    onFooterCellDblclick(scope) {
      this.$emit('footer-cell-dblclick', data);
      if (!this.params.dbFooterData) {
        return
      }
      const { $rowIndex, $columnIndex, cell } = scope
      const data = this.params.dbFooterData()
      const value = data[$rowIndex][$columnIndex]
      if (value && /\d/.test(value)) {
        cell.classList.add('dblclick_active')
        copyText(restoreSummaryFormatting(value), '复制成功!', true);
        setTimeout(() => {
          cell.classList.remove('dblclick_active')
        }, 300);
      }
    }
  }
};