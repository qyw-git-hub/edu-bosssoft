<template>
  <div :class="['wDeptSelect_single', limit]">
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
          >{{ node.label }}</span>
        </el-tooltip>
      </div>
    </el-tree>

    <div class="isSync" v-if="isSync">
      <el-checkbox v-model="isSyncValue" @change="onChangeCheckBox">同步到下级</el-checkbox>
    </div>
  </div>
</template>

<script>
/* limit
 * @parmas deptSty 样式1，见学生档案
 */
import mixSingle from '../../mixins/mixSingle';

export default {
  mixins: [mixSingle]
};
</script>