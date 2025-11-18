<template>
  <div class="wDeptSelect_single">
    <div class="mask" v-show="visible" @click="isShowPop"></div>
    <el-popover v-model="visible" v-bind="popoverAttrs" @hide="onPopoverHide">
      <el-input v-model="filterText" v-bind="inputAttrs" class="mb10" />
      <el-tree
        class="wDeptSelect_single_tree"
        :class="{ wDeptSelect_single_tree_disabled: treeAttrs.props.disabledText }"
        :style="treeAttrs.style"
        ref="tree"
        v-bind="treeAttrs"
        @node-click="onCheckTree"
        v-on="$listeners"
      >
        <div slot-scope="{ node, data }">
          <el-tooltip :content="node.label" :disabled="longTooltip" placement="top-start">
            <span
              class="over-ellipsis"
              :class="{ 'disabled-text': node.disabled && !data.cleanStyle }"
              @mouseover="onMouseOverToolTip($event)"
              >{{ node.label }}</span
            >
          </el-tooltip>
        </div>
      </el-tree>
      <el-select
        slot="reference"
        popper-class="wDeptSelect_single_select"
        :popper-append-to-body="false"
        v-bind="selectAttrs"
        v-model="selectOption"
        :style="{ width: selectAttrs.width }"
        @clear="onClearSelct"
        @click.native="isShowPop"
      >
        <el-option
          v-for="(item, index) in selectOptionList"
          :key="item[treeAttrs['node-key']] + index"
          :label="item[treeAttrs.props.label]"
          :value="item[treeAttrs['node-key']]"
        />
      </el-select>
    </el-popover>

    <div class="isSync" v-if="isSync">
      <el-checkbox v-model="isSyncValue" @change="onChangeCheckBox">同步到下级</el-checkbox>
    </div>
  </div>
</template>

<script>
import mixSingle from '../../mixins/mixSingle';

export default {
  mixins: [mixSingle],
};
</script>