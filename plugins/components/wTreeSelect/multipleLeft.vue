<template>
  <!-- 平铺多选树 适用:panel左边树形式、平铺树... -->
  <div class="tiled_multiple_tree">
    <template v-if="!$slots.default">
      <template v-if="showInput">
        <el-input v-model="filterText" v-bind="inputAttrs" clearable class="mb12" />
        <div class="flex mb12" v-for="item in conditionList" :key="item.id">
          <el-input
            v-model="item.value"
            :placeholder="`请输入条件${item.index + 1}`"
            size="small"
            clearable
          />
          <el-button
            class="default_btn"
            size="mini"
            icon="el-icon-delete"
            @click="onDeleteCondition(item)"
          />
        </div>
      </template>
      <w-button
        v-if="showMultiQuery"
        class="w100 flex_center addCondition"
        limit="add"
        type="plain"
        size="mini"
        @click="addCondition"
      >多条件查询</w-button>
    </template>
    <slot v-else></slot>
    <div class="flex flex_wrap mb10 operate_btn" v-if="showCheckBtn">
      <el-button
        type="primary"
        size="mini"
        :disabled="treeAttrs.disabled_all"
        @click="onChecked('all')"
      >全选</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="treeAttrs.disabled_reverse"
        @click="onChecked('reverse')"
      >反选</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="disabled_child"
        @click="onChecked('childAll')"
      >子级全选</el-button>
      <el-button
        type="primary"
        size="mini"
        :disabled="treeAttrs.disabled_clear"
        @click="onChecked('clear')"
      >清空</el-button>
      <!-- 禁用数据按钮 -->
        <el-tooltip
          class="item"
          effect="dark"
          :content="disabledBtnConfig.tooltipText"
          placement="top"
        >
          <el-button
            v-if="disabledBtnConfig.visible"
            type="primary"
            size="mini"
            @click="onDisabledData"
          >
            {{disabledBtnConfig.text}}
            <i class="el-icon-question parmary" />
          </el-button>
        </el-tooltip>
    </div>
    <slot name="button_suffix"></slot>
    <div class="wDeptSelect_multiple_tree">
      <el-tree
        ref="tree"
        v-bind="treeAttrs"
        :filter-node-method="filterInfo ? filterSlotNode : filterNode"
        @check="onCheckTree"
        v-on="$listeners"
      >
        <div
          class="w100 relative overflow_hidden"
          slot-scope="{ node, data }"
          @click="onClickTree(data)"
        >
          <el-tooltip :content="node.label" :disabled="longTooltip" placement="top-start">
            <span
              :class="['wDeptSelect-over-ellipsis', data.class]"
              :style="{ 
                width: treeAttrs.isShowProgress ? 'calc(100% - 60px)' : '100%',
                color: disabledBtnConfig.visible && data[disabledBtnConfig.name] ? '#B5BED1' : '' 
              }"
              @mouseover="onMouseOverToolTip"
            >
              <slot name="tree_expend" :node="data"></slot>
              {{ node.label }}
              <slot name="tree_suffix" :node="data"></slot>
              <span v-if="treeAttrs.isShowProgress" class="progress_chart">
                {{ data[treeAttrs.progressName || 'confirmPercentage'] || '0.00' }}%
                <i
                  class="el-icon-pie-chart"
                />
              </span>
            </span>
          </el-tooltip>
          <slot name="tree_expend_after" :node="data"></slot>
        </div>
      </el-tree>
    </div>
  </div>
</template>

<script>
/**
 * 2025-10-21 开放插槽 default、button_suffix、tree_expend、tree_expend_after、tree_suffix，左选树使用slot: { default: ()=> {}}方式使用
 */
import mixMultiple from '../../mixins/mixMultiple';
import { randomString } from '../../utils/common.js';
import { getDiffDate } from '../../utils/yearDate.js';

export default {
  mixins: [mixMultiple],
  props: {
    value: {
      type: [Array, Object, Number, String],
      default: () => []
    },
    // 筛选插槽内的检索值
    filterValue: { type: Array, default: () => [] },
    // 筛选插槽内的检索框属性设置，若无指定需传true开启，否则不开启自定义检索
    filterInfo: { type: [Object, Boolean], default: () => false },
    // 是否显示多条件筛选
    isHideMultiSearch: { type: Boolean, default: false },
    showCheckBtn: {
      type: Boolean,
      default: true
    },
    showInput: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      conditionList: [],
      isClick: false
    };
  },
  computed: {
    showMultiQuery() {
      return !this.isHideMultiSearch && this.conditionList.length < 5;
    }
  },
  watch: {
    value: {
      handler(value) {
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(value || [], this.treeAttrs['check-strictly']);
        });
      },
      immediate: true
    },
    parentValue: {
      /* 父组件的v-model值 */
      handler(value) {
        try {
          this.$refs.tree.setCheckedKeys(value, this.treeAttrs['check-strictly']);
        } catch (e) {
          this.$nextTick(() => {
            this.$refs.tree.setCheckedKeys(value || [], this.treeAttrs['check-strictly']);
          });
        }
      },
      immediate: true
    },
    conditionList: {
      /* 多条件值监听 */
      handler(value) {
        if (!this.isClick) {
          this.$refs.tree.filter(value);
        }
      },
      deep: true
    },
    filterValue: {
      /* 父组件条件筛选值监听 */
      handler(value) {
        const list = [];
        const values = [];
        if (this.filterInfo && typeof this.filterInfo == 'object') {
          for (const i in this.filterInfo) {
            const e = this.filterInfo[i];
            const curVal = value[i];
            switch (e.type) {
              case 'daterange': // 时间范围
                if (curVal && curVal[0]) {
                  const diffDate = getDiffDate(curVal[0], curVal[1]);
                  list.push({ data: diffDate, ...e });
                  values.push(diffDate);
                }
                break;
              default:
                list.push({ data: curVal, ...e });
                values.push(curVal);
                break;
            }
          }
        }
        this.$refs.tree.filter({ values, list });
      },
      deep: true
    }
  },
  methods: {
    /* 对树节点进行筛选时执行的方法，返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏 */
    filterNode(value, data) {
      const isOpenDisabled = this.disabledBtnConfig.visible && this.disabledConfig.isChecked
      if (!value && isOpenDisabled) {
        return !data[this.disabledBtnConfig.name];
      }
      value = this.conditionList.map(m => m.value).concat(this.filterText);
      data.visible = '1';
      if (value.every(e => !e)) {
        return true;
      }
      const _disabled = isOpenDisabled ? this.disabledBtnConfig.name : this.getNodeField('disabled') || 'disabled';
      const visible = value.every(e => data.parentLabel.filter(f => f.includes(e)).length > 0);
      data.visible = visible && !data[_disabled] ? '1' : '0';
      return data.visible == '1';
    },

    /* 过滤父组件传递过来的插槽条件 */
    filterSlotNode({ values, list }, data) {
      data.visible = '1';
      if (values.every(e => (Array.isArray(e) ? !e.length : !e))) {
        return true;
      }
      const visible = list.every(e => {
        /* 如果有设置等级查询 */
        const level = e.level;
        const _data = e.data;
        if (!_data) {
          return true;
        }
        if (Array.isArray(_data)) {
          return _data.some(s => {
            if (level) {
              const flag = data.parentLabel.some((m, i) => i >= level - 1 && m.includes(s));
              return flag && data.level >= level;
            }
            return data.parentLabel.filter(f => f.includes(s)).length > 0;
          });
        }
        if (level) {
          const flag = data.parentLabel.some((s, i) => i >= level - 1 && s.includes(_data));
          return flag && data.level >= level;
        }
        return data.parentLabel.filter(f => f.includes(_data)).length > 0;
      });
      data.visible = visible && !data.disabled ? '1' : '0';
      return data.visible == '1';
    },

    /* 新增条件 */
    addCondition() {
      this.setDelay();
      this.conditionList.push({ id: randomString(6), value: '', index: this.conditionList.length });
    },

    /* 删除条件 */
    onDeleteCondition(item) {
      !item.value && this.setDelay();
      this.conditionList = this.conditionList.filter(f => f.id != item.id);
    },

    /* 为了防止新增/删除条件时，树会自动展开项 */
    setDelay() {
      this.isClick = true;
      setTimeout(() => (this.isClick = false));
    },

    onCheckTree(obj, data) {
      const id = this.treeAttrs['node-key'];
      const children = this.getNodeField();
      let { checkedKeys } = data;
      if (checkedKeys.length < this.retainNum) {
        checkedKeys = this.selectOption;
        try {
          this.$refs.tree.setCheckedKeys(checkedKeys, this.treeAttrs['check-strictly']);
        } catch (e) {
          console.log(e)
        }
      }

      const _selectOption = [];
      const selectOptionKey = this.dataAll.filter(f => {
        const isFlag = (checkedKeys || []).includes(f[id]);
        const isVisible = isFlag && f.visible == '1';
        if (isVisible) {
          _selectOption.push(f[id]);
        }
        return isVisible;
      });

      try {
        this.$refs.tree.setCheckedKeys(_selectOption, this.treeAttrs['check-strictly']);
      } catch (error) {
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(_selectOption, this.treeAttrs['check-strictly']);
        });
      }

      this.selectOption = _selectOption;

      this.$emit('change', checkedKeys, selectOptionKey);

      /* 设置可勾选的子级 */
      const checked = checkedKeys.includes(obj[id]);
      this.lastChecked = obj;
      if (!this.treeAttrs['check-strictly']) {
        this.disabled_child = true;
      } else {
        if (checked) {
          this.disabled_child = !(obj[children] && obj[children].length > 0);
        } else {
          this.disabled_child = !checked;
        }
      }
    },
    getCheckedKeys(isleaf) {
      return this.$refs.tree.getCheckedKeys(isleaf) || [];
    },
    onClickTree(data) {
      this.$emit('clickTree', data);
    }
  }
};
</script>
