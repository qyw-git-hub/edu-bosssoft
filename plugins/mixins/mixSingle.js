export default {
  /**
   * author qyw
   * 树形选择器-单选
   * parent use: <wTreeSelectSingle :data="data" v-model="value" />
   * tips: 提供change事件，接收value数组, 提供el-tree所有事件的方法
   */
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    value: {
      type: [Array, Object, Number, String],
      default: ''
    },
    popoverParams: {
      type: Object,
      default: () => ({})
    },
    treeParams: {
      type: Object,
      default: () => ({ props: {} })
    },
    selectParams: {
      type: Object,
      default: () => ({})
    },
    inputParams: {
      type: Object,
      default: () => ({})
    },
    isSync: Boolean,
    // 只能选中最后一级
    onlyCheckLastLevel: Boolean,
    limit: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      filterText: '',
      selectOption: '',
      selectOptionList: [],
      longTooltip: false,
      isSyncValue: false
    };
  },
  computed: {
    treeAttrs() {
      /* 树结构参数 */
      let data = this.data;
      const { disabledParentNode } = this.treeParams;
      if (disabledParentNode) {
        data = this.data.map(m => ({
          ...m,
          disabled: !(m.children && m.children.length),
          cleanStyle: !(m.children && m.children.length)
        }));
      }
      return {
        data,
        'node-key': 'value',
        'expand-on-click-node': this.onlyCheckLastLevel || false,
        'highlight-current': true,
        'filter-node-method': this.filterNode,
        ...this.treeParams,
        props: {
          disabled: 'disabled',
          label: 'label',
          children: 'children',
          ...this.treeParams.props
        }
      };
    },
    selectAttrs() {
      /* 选择框的参数 */
      return {
        clearable: true,
        placeholder: '请选择',
        size: 'small',
        width: '100%',
        ...this.selectParams
      };
    },
    inputAttrs() {
      /* 输入框的参数 */
      return {
        placeholder: '输入关键字',
        'prefix-icon': 'el-icon-search',
        size: 'small',
        ...this.inputParams
      };
    },
    popoverAttrs() {
      /* 气泡框的参数 */
      return {
        'popper-class': 'wDeptSelect_single_popper',
        placement: 'bottom-start',
        trigger: 'manual',
        ...this.popoverParams
      };
    },
    getNodeField() {
      /* 获取树项目中指定的值（children/label, value建议使用node-key） */
      return (field = 'children') => {
        return this.treeAttrs.props[field];
      };
    }
  },
  watch: {
    data(value) {
      value.length > 0 && this.setValue(this.value);
    },
    value(value) {
      this.setValue(value);
    },
    filterText(value) {
      this.$refs.tree.filter(value);
    }
  },
  created() {
    this.setValue(this.value);
  },
  methods: {
    /* 找无限下级 */
    filterArray(data, value) {
      data.forEach(e => {
        if (e[this.treeAttrs['node-key']] == value) {
          this.selectOptionList.push(e);
        } else {
          if (e[this.getNodeField()] && e[this.getNodeField()].length > 0) {
            this.filterArray(e[this.getNodeField()], value);
          }
        }
      });
    },
    /* 赋值 */
    setValue(value) {
      this.selectOptionList = [];
      this.selectOption = value || '';
      this.$nextTick(() => {
        this.$refs.tree.setCurrentKey(value || null);
      });
      value && this.filterArray(this.data, value);
    },
    /* 对树节点进行筛选时执行的方法，返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏 */
    filterNode(value, data, node) {
      if (!value) return true;
      return node.label.indexOf(value) !== -1;
    },
    /* 移入tooltip时，超出才显示提示框 */
    onMouseOverToolTip(e) {
      this.longTooltip = e.currentTarget.scrollWidth <= e.currentTarget.clientWidth;
    },
    /* 点击展开下拉框 */
    isShowPop() {
      if (this.selectParams && this.selectParams.disabled) return;
      this.visible = !this.visible;
      this.$emit('visible', this.visible);
    },
    /* 选择树节点某一项 */
    onCheckTree(data) {
      // 增加配置：只能选中最后一级
      if (this.onlyCheckLastLevel && data[this.treeAttrs.props.children] && data[this.treeAttrs.props.children].length > 0) {
        return
      }
      if (!data[this.getNodeField('disabled')]) {
        const method = () => {
          this.selectOption = data[this.treeAttrs['node-key']];
          this.selectOptionList = [data];
          this.$emit('change', data[this.treeAttrs['node-key']], data);
          this.visible = false;
        };
        if (
          this.treeAttrs['expand-on-click-node'] &&
          (!data[this.getNodeField()] || data[this.getNodeField()].length <= 0)
        ) {
          method();
        } else if (!this.treeAttrs['expand-on-click-node']) {
          method();
        }
      } else {
        this.$refs.tree.setCurrentKey(this.value);
      }
    },
    /* 清空 */
    onClearSelct() {
      this.$refs.tree.setCurrentKey(null);
      this.$emit('change', null);
    },
    /* 关闭弹窗*/
    onclose() {
      this.visible = false;
    },
    /* 监听同步到下级的CheckBox */
    onChangeCheckBox(value) {
      this.$emit('getSyncValue', value);
    },
    /* 隐藏弹窗 */
    onPopoverHide() {
      this.filterText = '';
    },
  }
};