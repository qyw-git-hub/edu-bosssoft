<template>
  <div class="wDeptSelect_multiple">
    <div class="mask" v-show="visible" @click.stop="isShowPop"></div>
    <el-popover
      trigger="manual"
      v-model="visible"
      v-bind="popoverAttrs"
      @show="popoverShow"
      @hide="popoverHide"
    >
      <el-input v-model="filterText" v-bind="inputAttrs" class="mb10" />
      <div
        v-loading="dataGenerationLoading"
        element-loading-text="加载中，请稍后..."
        element-loading-spinner="el-icon-loading"
      >
        <div class="flex mb10">
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
            v-if="!treeAttrs.hideChildBtn"
            type="primary"
            size="mini"
            :disabled="disabled_child"
            @click="onChecked('childAll')"
          >子级全选</el-button>
          <el-button
            :disabled="treeAttrs.disabled_clear"
            type="primary"
            size="mini"
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
        <div class="wDeptSelect_multiple_tree">
          <p
            :style="{
            'margin-left': placeholderConfig.left + 'px',
            'height': '0',
            'opacity': '0',
            }"
          >{{placeholderConfig.label}}</p>
          <vue-easy-tree ref="tree" v-bind="treeAttrs" v-on="$listeners" @check="onCheckTree">
            <div slot-scope="{ node, data }">
              <el-tooltip :content="node.label" :disabled="longTooltip" placement="top-start">
                <span
                  :class="['wDeptSelect-over-ellipsis', data.class]"
                  :style="{ 
                    width: '690px', 
                    color: disabledBtnConfig.visible && data[disabledBtnConfig.name] ? '#B5BED1' : '' 
                  }"
                  @mouseover="onMouseOverToolTip"
                >
                  <slot name="tree_expend" :node="data"></slot>
                  {{ node.label }}
                </span>
              </el-tooltip>
            </div>
          </vue-easy-tree>
        </div>
      </div>
      <div slot="reference" class="pointer">
        <!-- 不以el-select直接作为el-popover触发器，会导致更新回显异常 -->
        <el-select
          ref="mulSelect"
          :popper-append-to-body="false"
          popper-class="wDeptSelect_multiple_select"
          v-bind="selectAttrs"
          v-model="limitSelection"
          :style="{ width: selectAttrs.width }"
          :class="[
            !selectAttrs.clearable && selectOption.length <= retainNum ? 'none_click' : '',
            !selectAttrs['collapse-tags'] && selectAttrs.limit == 1 ? 'wTreeSelect_no_collapse_tags' : ''
          ]"
          @click.native="isShowPop"
          @change="onChangeSelect"
          @remove-tag="onClearSelct(selectOption, selection)"
          @clear="onClearSelct([], [])"
        >
          <!-- 长度为limit，只会渲染极少量的DOM -->
          <el-option
            v-for="item in elOptionDataSource"
            class="virtual-el-option-item"
            :key="item[treeAttrs['node-key']]"
            :label="item[getNodeField('label')]"
            :value="item[treeAttrs['node-key']]"
          />
        </el-select>
      </div>
    </el-popover>
  </div>
</template>

<script>
import mixMultiple from '../../mixins/mixMultiple';
import VueEasyTree from '@wchbrad/vue-easy-tree';

export default {
  mixins: [mixMultiple],
  components: { 'vue-easy-tree': VueEasyTree },
  watch: {
    parentValue: {
      handler(value) {
        if (JSON.stringify(value) != this.defaultValue) {
          this.defaultValue = JSON.stringify(value);
          const checkStrictly = this.treeAttrs['check-strictly'];
          try {
            this.$refs.tree.setCheckedKeys(value || [], checkStrictly);
            this.selectOption = this.$refs.tree.getCheckedKeys();
          } catch (e) {
            this.$nextTick(() => {
              this.$refs.tree.setCheckedKeys(value || [], checkStrictly);
              this.selectOption = this.$refs.tree.getCheckedKeys();
            });
          }
        }
      },
      immediate: true
    }
  }
};
</script>
