<template>
  <w-dialog
    class="treeMultipleDialog"
    :params="dialogAttrs"
    :visible.sync="dialogVisible"
    append-to-body
    @open="onOpen"
    @close="onClose"
    @submit="onSubmit"
  >
    <el-input v-model="filterText" v-bind="inputAttrs" clearable class="mb10" />
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
    </div>
    <div class="wDeptSelect_multiple_tree">
      <el-tree ref="tree" :key="key" v-bind="treeAttrs" @check="onCheckTree" v-on="$listeners">
        <div slot-scope="{ node, data }">
          <el-tooltip :content="node.label" :disabled="longTooltip" placement="top-start">
            <span
              :class="['wDeptSelect-over-ellipsis', data.class]"
              @mouseover="onMouseOverToolTip"
            >
              <slot name="tree_expend" :node="data"></slot>
              {{ node.label }}
            </span>
          </el-tooltip>
        </div>
      </el-tree>
    </div>
  </w-dialog>
</template>

<script>
import mixMultiple from '../../mixins/mixMultiple';
import { randomString, deepClone } from '../../utils/common.js';
import wDialog from '../wDialog/index.vue'
export default {
  mixins: [mixMultiple],
  props: {
    show: Boolean,
  },
  components: {
    wDialog
  },
  data() {
    return {
      key: 'tree-' + randomString(),
      defaultCheckedData: '',
      defaultSelectData: '',
      dialogParams: { title: '选择收费范围', width: '400px', submitText: '确认' },
      isSubmit: false
    }
  },
  computed: {
    dialogVisible: {
      set(val) {
        this.$emit('update:show', val)
      },
      get() {
        return this.show
      }
    },
    dialogAttrs() {
      return { ...this.dialogParams, ...this.$attrs }
    }
  },
  methods: {
    onOpen() {
      this.isSubmit = false
      this.selectOption = JSON.parse(JSON.stringify(this.parentValue || []))
      try {
        this.$refs.tree.setCheckedKeys(this.selectOption, this.treeAttrs['check-strictly'])
      } catch (error) {
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(this.selectOption, this.treeAttrs['check-strictly'])
        })
      }
      this.$nextTick(() => {
        const checkedNodes = this.$refs.tree.getCheckedNodes()
        const checkedKeys = this.$refs.tree.getCheckedKeys()
        const selectNodes = checkedNodes.filter(f => this.selection.includes(f[this.treeAttrs['node-key']]))
        this.defaultCheckedData = deepClone({ checkedKeys, checkedNodes })
        this.defaultSelectData = deepClone({ selectKeys: this.selection, selectNodes })
        this.$el.querySelector('.wDeptSelect_multiple_tree').scrollTop = 0
      })
    },
    onClose() {
      this.filterText = '';
      const checkedKeys = this.$refs.tree.getCheckedKeys()
      if (JSON.stringify(this.defaultCheckedData.checkedKeys) != JSON.stringify(checkedKeys) && !this.isSubmit) {
        this.$emit('close', this.defaultCheckedData, this.defaultSelectData)
      }
    },
    onSubmit() {
      this.isSubmit = true
      const checkedKeys = this.$refs.tree.getCheckedKeys()
      const checkedNodes = this.$refs.tree.getCheckedNodes()
      let selectNodes = []
      if (JSON.stringify(this.defaultCheckedData.checkedKeys) != JSON.stringify(checkedKeys)) {
        selectNodes = checkedNodes.filter(f => this.selection.includes(f[this.treeAttrs['node-key']]))
        this.$emit('submit', { checkedKeys, checkedNodes }, { selectKeys: this.selection, selectNodes })
      }
      this.dialogVisible = false
    }
  }
}
</script>