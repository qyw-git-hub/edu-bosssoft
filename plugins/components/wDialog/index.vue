<template>
  <el-dialog
    class="wDialog"
    :visible.sync="isOpen"
    v-bind="dialogAttrs"
    v-on="$listeners"
    @close="onClose"
  >
    <template slot="title">
      <slot name="title">{{dialogAttrs.title}}</slot>
    </template>
    <div
      v-loading="dialogAttrs.loading"
      element-loading-text="加载中，请稍候..."
      element-loading-spinner="el-icon-loading"
    >
      <slot v-if="$slots.default"></slot>
      <form-create
        v-else
        ref="formCreate"
        v-model="fApi"
        :rule="rule"
        :option="getOptions"
        :value.sync="values"
      >
        <template v-for="key in Object.keys($scopedSlots)" :slot="'type-'+key" slot-scope="scope">
          <el-col
            :key="key+randomString()"
            :span="scope.rule.col?scope.rule.col.span:getOptions.col.span"
          >
            <slot :name="key" :rule="scope.rule" />
          </el-col>
        </template>
      </form-create>
    </div>
    <template v-if="!dialogAttrs.hiddenFooter">
      <span v-if="!$slots.footer" slot="footer" class="dialog-footer">
        <el-button
          class="list-btn"
          v-if="!dialogAttrs.hiddenCancelBtn"
          @click="onCancel"
        >{{dialogAttrs.cancelText || '取消'}}</el-button>
        <el-button
          class="list-btn"
          v-if="!dialogAttrs.hiddenSubmitBtn"
          v-bind="dialogAttrs.submitBtnAttrs"
          type="primary"
          @click="onSubmit"
          :loading="dialogAttrs.loading_submit"
        >{{dialogAttrs.submitText || '提交'}}</el-button>
      </span>
      <slot v-else class="dialog-footer" slot="footer" name="footer"></slot>
    </template>
  </el-dialog>
</template>

<script>
import wDialog from '../../mixins/wDialog.js'
export default {
  mixins: [wDialog],
}
</script>
<!--
  @description 当自定义插槽存在缓存，需要根据数据更新时:
  1. 绑定case: false(此设置会导致下方的文本框失效)
  2. 使用hidden: true，绑定field值，手动改变hidden值就能更新
  3. 使用fApi.sync('goods_name')更新

  @description 自定义指令:
  directives:[{
    name: 'blur',
    arg: 'price',
    value: (value) => {
      return that.fApi && that.fApi.setValue({ [field]: value })
    }
  }]
 -->
