import { debounce } from '../utils/common.js';

export default {
  /**
   * author qyw
   * 树形选择器-多选
   * parent use: <wTreeSelectMult :data="data" v-model="value" />
   * tips: 提供change事件，接收value数组, 提供el-tree所有事件的方法
   *
   * update: 2023-02-03 增加 `retainNum` 参数，默认树结构至少有retainNum个选中，且不能被取消, 需配合clearable: false使用
   * update: 2023-03-16 增加 `isResetDataAll` 参数，是否每次都清空已缓存数据，重新转换为平级。
   *         例如：单位和班级联动选择，单位选择之后要请求接口获取相应的班级信息，班级选择框需要加这个。
   * update: 2023-07-20 增加 emit方法， `selectChange` 返回参数 [当前key选择项-末级，对应nodes项-末级]
   * update: 2023-08-31 添加注释，改变 `.value` 为 `[node-key]`
   * update: 2023-09-01 修复 全选/反选 操作会操作所有数据的问题(操作时原数据上新增visible: '0' - 不显示, '1'显示)
   * update: 2023-09-12 扁平化树时新增 `parentChain`, 记录从父级到当前结点的路劲(适配学生组织管理搜索需要)，
   *         el-select 的 remove-tag 和 clear 方法增加抛出emit方法 clear, 适用于排除change和visible改变时触发的情景
   *
   * update: 2023-09-21 暴露出 this.$emit('show')，打开popover时触发
   * update: 2025-02-18 暴露出 this.$emit('hide')，关闭popover时触发
   * 
   * update: 2025-11-3 新增操作显示禁用数据onDisabledData方法，需要将传递过来的props下的disabled字段指定为非disabled名称，并且将disabledBtnConfig下的name指定为需要禁用的字段
   */
  model: { prop: 'parentValue', event: 'change' },
  props: {
    data: { type: Array, default: () => [] },
    parentValue: { type: [Array, Object, Number, String], default: () => [] },
    retainNum: { type: [Number, String], default: 0 },
    isResetDataAll: { type: Boolean, default: false },
    popoverParams: { type: Object, default: () => ({}) },
    treeParams: { type: Object, default: () => ({ props: {} }) },
    selectParams: { type: Object, default: () => ({}) },
    inputParams: { type: Object, default: () => ({}) },
    disabledBtnConfig: {
      type: Object,
      default: () => { //是否显示禁用数据按钮
        return {
          visible: false,
          text: '禁用数据',
          tooltipText: '提示：点击一次即可查询禁用账单，再次点击取消禁用账单查询',
          name: 'disabled'
        }
      }
    },
  },
  data() {
    return {
      visible: false,
      longTooltip: false,
      disabled_child: true,
      dataGenerationLoading: false,
      filterText: '',
      nodeIndexMap: null, //树节点索引
      lastChecked: {},
      dataAll: [], //一维拉平节点数据
      selection: [], //选中的末级节点key数组,用于业务逻辑,通常只需要末级节点
      defaultValue: [], //默认选中项
      selectOption: [], //所有选中节点的key数组,用于tree组件的选中状态
      elOptionDataSource: [], //下拉框数据源
      disabledConfig: {
        isChecked: false
      }, // 禁用数据默认列表，用于切换
      placeholderConfig: {
        // 占位文字配置
        label: '',
        left: ''
      }
    };
  },
  computed: {
    /* 树结构参数 */
    treeAttrs() {
      const isVirtual = typeof this.treeParams.isVirtual == 'boolean' ? this.treeParams.isVirtual : true;
      return {
        data: this.data,
        'show-checkbox': true,
        'node-key': 'value',
        'expand-on-click-node': true,
        'highlight-current': true,
        'filter-node-method': this.filterNode,
        'check-strictly': true,
        isShowProgress: false,
        hideChildBtn: false,
        ...this.treeParams,
        /* 虚拟滚动需设置高度即生效 */
        height: isVirtual ? this.treeParams.treeHeight || '300px' : 'auto', //虚拟滚动区域高度
        props: { label: 'label', children: 'children', ...this.treeParams.props },
      };
    },
    /* 选择框的参数 */
    selectAttrs() {
      return {
        multiple: true,
        clearable: true,
        placeholder: '请选择',
        size: 'small',
        width: '100%',
        'collapse-tags': true,
        limit: 1, // 下拉显示最大个数
        ...this.selectParams
      };
    },
    /* 气泡框的参数 */
    popoverAttrs() {
      return {
        'popper-class': 'w-tree-select-popover',
        placement: 'bottom-start',
        trigger: 'manual',
        ...this.popoverParams
      };
    },
    /* 输入框的参数 */
    inputAttrs() {
      return {
        placeholder: '输入关键字',
        'prefix-icon': 'el-icon-search',
        size: 'small',
        ...this.inputParams
      };
    },
    /**
     * 获取树项目中指定的值（children/label, value建议使用node-key）
     */
    getNodeField() {
      return (field = 'children') => this.treeAttrs.props[field];
    },
    /**
     * 用于限制下拉展示个数
     */
    limitSelection: {
      get() {
        const isMoreTags = this.selectAttrs.limit > 1 && !this.selectAttrs['collapse-tags'];
        return isMoreTags ? this.selection.slice(0, this.selectAttrs.limit) : this.selection;
      },
      set(val) {
        this.selection = val;
      }
    },
    // 将 selectOption 和 selection 转换为 Set，优化查找性能
    selectionSet() {
      return new Set(this.selection || []);
    },
    selectOptionSet() {
      return new Set(this.selectOption || []);
    },
    // 获取最长宽度字符宽度，根据字体大小计算
    getStringVisualWidth() {
      return (str) => {
        str = String(str)
        const chinesePattern = /[\u4e00-\u9fff]/g;
        const otherPattern = /[0-9a-zA-Z.,;:!?'"、，；：！？""''（）【】{}_+=<>/@#$%^&*~`|\\-]/g;

        const chineseCount = (str.match(chinesePattern) || []).length;
        const otherCount = (str.match(otherPattern) || []).length;

        return chineseCount * 14 + otherCount * 14;
      }
    },
  },
  watch: {
    filterText(value) {
      const fn = debounce(this.$refs.tree.filter, 150);
      fn(value);
    },
    data: {
      handler(value) {
        this.setValue(value);
      },
      deep: true,
      immediate: true
    },
    selectOption: {
      handler(value) {
        this.getSelections(value);
        this.$nextTick(() => {
          this.updateSelectOptionList();
          this.elSelectLimitHandle(value);
        });
      },
      immediate: true
    }
  },
  methods: {
    /* 树节点筛选方法，返回true显示、false隐藏 */
    filterNode(value, data) {
      const isOpenDisabled = this.disabledBtnConfig.visible && this.disabledConfig.isChecked
      if (!value) {
        if (isOpenDisabled) {
          return !data[this.disabledBtnConfig.name];
        }
        return true;
      }
      let show = true
      const _disabled = isOpenDisabled ? this.disabledBtnConfig.name : this.getNodeField('disabled') || 'disabled';
      const _label = this.getNodeField('label');
      const checkStrictly = this.treeAttrs['check-strictly'];
      show = data[_label].indexOf(value) !== -1 && !data[_disabled];
      if (!checkStrictly && (data.parentLabel || []).some(s => s.indexOf(value) !== -1) && !data.disabled) {
        show = true
      }
      data.visible = show ? '1' : '0';
      return show;
    },
    /* 移入tooltip时，超出才显示提示框 */
    onMouseOverToolTip(event) {
      this.longTooltip = event.currentTarget.scrollWidth <= event.currentTarget.clientWidth;
    },
    /* 点击展开下拉框 */
    isShowPop(value) {
      if (!this.selectAttrs.disabled) {
        this.visible = typeof value == 'boolean' ? value : !this.visible;
        const checkedKeys = this.$refs.tree.getCheckedKeys();
        this.$emit('visible', this.visible, checkedKeys, this.selection);
        this.visible && this.filterArray();
      }
    },
    /* 获取字符宽度 */
    getLabelWidth(e, label) {
      if (this.placeholderConfig.label.length <= label.length) {
        this.placeholderConfig.left = 46 + ((e.level - 1) * 18)
        this.placeholderConfig.label = label
      }
    },
    /* 将当前数据转为平级 */
    filterArray() {
      return new Promise(resolve => {
        this.dataGenerationLoading = true;
        const _child = this.getNodeField();
        const _label = this.getNodeField('label');
        const _nodeKey = this.treeAttrs['node-key'];

        const callback = data => {
          let index = 0;
          this.dataAll = [];
          this.nodeIndexMap = new Map();
          const stack = []; // 栈模拟递归
          stack.push({ data, parentNode: null, level: 0 });
          const processFrame = () => {
            const startTime = performance.now(); // 记录帧开始时间
            while (stack.length > 0) {
              const { data, parentNode, level } = stack.pop(); // 取出栈顶元素
              data.forEach(e => {
                const label = e[_label];
                const value = e[_nodeKey];
                const children = e[_child];
                e.containSubLevels = !!(children && children.length > 0); //是否含有子级
                if (!e[this.treeAttrs.props.disabled] || this.selectOptionSet.has(value)) {
                  index++;
                  e.visible = '1';
                  e.level = level ? level + 1 : 1;
                  const hasParent = parentNode && parentNode.parentChain;
                  e.parentChain = hasParent ? parentNode.parentChain + ',' + value : value;
                  e.parentLabel = hasParent ? [...parentNode.parentLabel, label] : [label];
                  this.dataAll.push(e);
                  this.nodeIndexMap.set(e[_nodeKey], index); // 根据唯一Key,绑定Index
                }
                if (e.containSubLevels) {
                  stack.push({ data: children, parentNode: e, level: e.level }); // 将子节点压入栈
                }
                // 计算当前节点的宽度
                this.getLabelWidth(e, label)
              });
              // 每帧最多执行 16ms（约 60 FPS）
              if (performance.now() - startTime > 16) {
                requestAnimationFrame(processFrame); // 下一帧继续执行
                return;
              }
            }
            this.dataGenerationLoading = false;
            resolve();
          };
          requestAnimationFrame(processFrame); // 启动第一帧
        };
        /**
         * 此处因考虑性能，普通情况使用了 this.dataAll.length <= 0 才会重新扁平化
         * 但存在页面有两个单位多选下拉框，且有联动的情况，则需要重新扁平化
         * 如：单位多选框，班级的 option  根据单位选择接口获取来
         * 此处解决重新赋值后全选选不中的问题，因为一般情况下 dataAll 有值不扁平化，加 isResetDataAll 重新扁平化
         */
        const source = this.data || [];
        if (this.isResetDataAll) {
          this.nodeIndexMap = null;
          this.elOptionDataSource = [];
          callback(source);
        } else {
          if (this.dataAll.length <= 0) {
            callback(source);
          } else {
            this.dataGenerationLoading = false;
            resolve();
          }
        }
      });
    },
    /* 清空并赋值 */
    async setValue(value) {
      const checkStrictly = this.treeAttrs['check-strictly'];
      if (value && value.length > 0) {
        // 此处需等待数据处理完成，在设置下面的selectOption，触发watch完成回显
        await this.filterArray();
        if (this.disabledBtnConfig.visible) { //重新进行过滤，确保所有禁用节点显示
          this.$nextTick(() => this.$refs.tree.filter(''))
        }
      }
      try {
        this.selectOption = this.parentValue || [];
        this.$refs.tree.setCheckedKeys(this.selectOption, checkStrictly);
      } catch (e) {
        this.$nextTick(() => {
          this.selectOption = this.parentValue || [];
          this.$refs.tree && this.$refs.tree.setCheckedKeys(this.selectOption, checkStrictly);
        });
      }
      // 考虑v-mode赋值后，数据源还未生成完毕，导致回显不生效
      this.parentValue && this.parentValue.length && this.updateSelectOptionList(true);
    },
    /* 选择树节点某一项 */
    onCheckTree: debounce(async function (node, data) {
      const _nodeKey = this.treeAttrs['node-key'];
      const checkStrictly = this.treeAttrs['check-strictly'];
      let { checkedKeys } = data;
      if (checkedKeys.length < this.retainNum) {
        checkedKeys = this.selectOption;
        try {
          this.$refs.tree.setCheckedKeys(checkedKeys, checkStrictly);
        } catch (e) {
          console.log(e)
        }
      }
      this.selectOption = checkedKeys;
      const selectNodes = this.dataAll.filter(item => this.selectOptionSet.has(item[_nodeKey]));
      this.$emit('change', checkedKeys, selectNodes);
      const checked = this.selectOptionSet.has(node[_nodeKey]);
      this.lastChecked = node;
      if (!checkStrictly) {
        this.disabled_child = true;
      } else {
        const _child = this.getNodeField();
        this.disabled_child = checked ? !(node[_child] && node[_child].length > 0) : true;
      }
    }, 200),
    /* 下拉框监听 */
    onChangeSelect(value) {
      this.selectOption = value;
      const _nodeKey = this.treeAttrs['node-key'];
      const checkStrictly = this.treeAttrs['check-strictly'];
      const selectNodes = this.dataAll.filter(item => this.selectOptionSet.has(item[_nodeKey]));
      this.$emit('change', value, selectNodes);
      try {
        this.$refs.tree.setCheckedKeys(value, checkStrictly);
      } catch (error) {
        this.$nextTick(() => this.$refs.tree.setCheckedKeys(value || [], checkStrictly));
      }
    },
    /* 清除选中项 / 清除所有 */
    onClearSelct(selectOption = [], selection = []) {
      const _nodeKey = this.treeAttrs['node-key'];
      const selectOptionKey = this.dataAll.filter(item => this.selectOptionSet.has(item[_nodeKey]));
      const selectionKey = this.dataAll.filter(item => this.selectionSet.has(item[_nodeKey]));
      this.$emit('change', selectOption, selectOptionKey);
      this.$emit('selectChange', selection, selectionKey);
      this.$emit('clear', selectOption, selectOptionKey);
    },
    /* 
      保持选中keys集合前limit位，与数据集合前limit位一致，即可回显成功
      elSelectShowBaseData长度永远为limit，优化el-option的DOM渲染数
     */
    updateSelectOptionList(updateChecked = false) {
      this.$nextTick(() => {
        this.elOptionDataSource = [];
        const checkStrictly = this.treeAttrs['check-strictly'];
        const { data, selectOption, nodeIndexMap, dataAll } = this;
        const isBreak = data.length == 0 || dataAll.length == 0 || selectOption.length == 0 || !nodeIndexMap;
        if (isBreak) return;

        const nodeExchange = key => {
          const index = nodeIndexMap.get(key) - 1; // 根据key获取原始数据的索引
          const node = dataAll[index]; // 根据索引拿到节点data
          node && this.elOptionDataSource.unshift(node); // 添加data到前limit位，保证回显成功
        };
        // 考虑父子不关联 && limit>= 1的情况，统一以limit为数据项长度，保证回显成功
        const checkedKeys = checkStrictly ? selectOption : this.limitSelection;
        if (checkedKeys.length == 1) {
          nodeExchange(checkedKeys[0]);
        } else {
          const beforeLimit = checkedKeys.slice(0, this.selectAttrs.limit);
          const reverse = beforeLimit.reverse();
          reverse.forEach(key => nodeExchange(key));
        }

        // 初始化赋值时、父子不关联、选中第一项为父级，则子级全选默认可用
        if (checkStrictly && updateChecked && selectOption.length == 1) {
          const _child = this.getNodeField();
          const firstNodeIndex = nodeIndexMap.get(selectOption[0]) - 1;
          const node = dataAll[firstNodeIndex];
          const hasChild = node[_child] && node[_child].length;
          this.disabled_child = !hasChild;
          this.lastChecked = hasChild ? node : {};
        }
      });
    },
    /* 点击全选、反选、子级全选、清空个按钮 */
    onChecked: debounce(async function (type, callback) {
      try {
        this.dataGenerationLoading = true;
        await new Promise(resolve => {
          // 1. 缓存常用值
          let finalSelection = null;
          const { retainNum, treeAttrs, dataAll } = this;
          const _child = this.getNodeField();
          const _nodeKey = treeAttrs['node-key'];
          const checkStrictly = treeAttrs['check-strictly'];
          const handleNodes = this.filterText ? dataAll.filter(f => !f.visible || f.visible == '1') : dataAll;
          const filterVisibleData = new Set(handleNodes);

          // 2. 批量处理逻辑
          const batchProcess = () => {
            switch (type) {
              // 全选
              case 'all': {
                // 使用 Set 优化查找
                const result = [];
                filterVisibleData.forEach(node => {
                  if ((retainNum > 0 || !node.disabled)) {
                    result.push(node[_nodeKey]);
                  }
                });
                finalSelection = result;
                break;
              }

              // 反选
              case 'reverse': {
                const checked = new Set(this.$refs.tree.getCheckedKeys());
                const result = [];
                const resultSet = new Set();
                filterVisibleData.forEach(node => {
                  const nodeValue = node[_nodeKey];
                  if (!checked.has(nodeValue) || (node.disabled && checked.has(nodeValue))) {
                    if (checkStrictly || !node[_child] || !node[_child].length) {
                      result.push(nodeValue);
                      resultSet.add(nodeValue);
                    }
                  }
                });

                // 处理 retainNum 逻辑
                if (retainNum > 0 && result.length < retainNum) {
                  const remainingNodes = Array.from(filterVisibleData).filter(f => !resultSet.has(f[_nodeKey]));
                  const lackQuantity = retainNum - result.length; //缺少个数
                  // 父子不关联，直接取0至lackQuantity ：父子关联，过滤掉父级节点后，取0至lackQuantity
                  const resNodes = checkStrictly ? remainingNodes : remainingNodes.filter(v => !v.containSubLevels);
                  const endNodes = resNodes.slice(0, lackQuantity);
                  const endKeys = endNodes.map(n => n[_nodeKey]);
                  result.push(...endKeys);
                }
                finalSelection = result;
                break;
              }
              // 子级全选
              case 'childAll': {
                const checked = new Set(this.$refs.tree.getCheckedKeys());
                const result = new Set(this.selectOption);

                // 递归处理子节点，使用队列替代递归
                const queue = [...(this.lastChecked[_child] || [])];
                while (queue.length) {
                  const node = queue.shift();
                  if ((node.disabled && checked.has(node[_nodeKey])) || !node.disabled) {
                    result.add(node[_nodeKey]);
                  }
                  const children = node[_child];
                  if (children && children.length) {
                    queue.push(...children);
                  }
                }

                finalSelection = Array.from(result);
                break;
              }
              // 清空
              case 'clear': {
                if (this.retainNum > 0) {
                  const checkedKeys = this.$refs.tree.getCheckedKeys();
                  const useKeys = checkStrictly ? checkedKeys : this.selection;
                  finalSelection = useKeys.slice(0, retainNum);
                } else {
                  finalSelection = [];
                }
                break;
              }
            }
            this.selectOption = finalSelection;
            callback && callback(finalSelection);
          };

          // 3. 使用 requestAnimationFrame 优化性能
          requestAnimationFrame(() => {
            batchProcess();
            // 4. 设置选中状态
            this.$nextTick(() => {
              this.$refs.tree.setCheckedKeys(this.selectOption);
              const selectOptionKey = Array.from(filterVisibleData).filter(item =>
                this.selectOptionSet.has(item[_nodeKey])
              );
              resolve();
              this.$emit('change', this.selectOption, selectOptionKey);
            });
          });
        });
      } catch (error) {
        this.dataGenerationLoading = false;
        console.error('Error in onChecked:', error);
      } finally {
        // 清除 loading 状态
        this.dataGenerationLoading = false;
      }
    }, 200),
    /* 操作显示禁用数据 */
    async onDisabledData() {
      this.disabledConfig.isChecked = !this.disabledConfig.isChecked
      this.$refs.tree.filter(this.filterText);
      const _nodeKey = this.treeAttrs['node-key'];
      const disabledKey = this.disabledBtnConfig.name
      await this.filterArray();
      this.selectOption = this.dataAll.filter(f => {
        return this.selectOptionSet.has(f[_nodeKey]) && !f[disabledKey]
      }).map(m => m[_nodeKey])
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys(this.selectOption);
        const selectOptionKey = this.dataAll.filter(item =>
          this.selectOptionSet.has(item[_nodeKey])
        );
        this.$emit('change', this.selectOption, selectOptionKey);
      });
    },
    /* 组装 selection 的值，主要判断 check-strictly */
    getSelections(value) {
      this.selection = value;
      if (!this.treeAttrs['check-strictly']) {
        this.$nextTick(() => {
          const _nodeKey = this.treeAttrs['node-key'];
          if (value && value.length > 0) {
            try {
              const checkedNodes = this.$refs.tree.getCheckedNodes();
              const _child = this.getNodeField();
              // 过滤非末级节点，获取所有选中节点的子节点的keys
              this.selection = checkedNodes.filter(f => !f[_child] || !f[_child].length).map(m => m[_nodeKey]);
            } catch (error) {
              console.log(error)
            }
          }
          const selectionList = this.dataAll.filter(item => this.selectionSet.has(item[_nodeKey]));
          this.$emit('selectChange', this.selection, selectionList);
        });
      }
    },
    /**
     * 获取选中的实际值与结点等
     * 返回当前树中选中的结点(checkedNodes)、值(checkedKeys)以及实际应该选择的值(selection，级联则去除父级结点)
     */
    getCheckedValue() {
      const checkedNodes = this.$refs.tree.getCheckedNodes();
      const checkedKeys = this.$refs.tree.getCheckedKeys();
      const halfCheckedKeys = this.$refs.tree.getHalfCheckedKeys();
      return { checkedNodes, checkedKeys, selection: this.selection, halfCheckedKeys };
    },
    /* popover显示 */
    popoverShow() {
      // 设置html根元素overflow-y为hidden，防止页面抖动
      this.treeAttrs.height && (document.documentElement.style.overflowY = 'hidden');
      this.$emit('show');
    },
    /* popover隐藏 */
    popoverHide() {
      this.filterText = '';
      // 移除overflowY属性
      this.treeAttrs.height && (document.documentElement.style.overflowY = '');
      this.$emit('hide');
    },
    /* el-select最大显示数+1处理 */
    elSelectLimitHandle(value) {
      const { limit, 'collapse-tags': collapseTags } = this.selectAttrs;
      const el = document.querySelector('.wDeptSelect_multiple .el-select__tags>span:nth-child(1)');

      if (el && limit > 1 && !collapseTags) {
        const tag_info_els = document.querySelectorAll('.wDeptSelect_multiple .el-tag.el-tag--info');
        tag_info_els.forEach(f => (f.style['max-width'] = 100 / limit + '%'));
        const oneMore = limit + 1;
        if (el.childNodes.length < oneMore && value.length >= oneMore) {
          const span = document.createElement('span');
          span.setAttribute('class', 'el-tag el-tag--info el-tag--mini el-tag--light wDeptSelect_multiple_more_text');
          span.style.order = oneMore;
          span.innerHTML = '<span class="el-select__tags-text">+1</span>';
          el.appendChild(span);
        } else if (value.length < oneMore) {
          const more_text_el = document.querySelector('.wDeptSelect_multiple_more_text');
          more_text_el && more_text_el.remove();
        }
      }
    },
  }
};
