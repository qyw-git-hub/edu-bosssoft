<template>
  <form-create v-model="fApi" :rule="rule" :option="option" @change="onChange"></form-create>
</template>

<script>
export default {
  props: {
    searchList: { type: [Array, Object], default: () => [] },
    defaultConfig: { type: Array, default: () => [] },
    fieldProps: { type: Object, default: () => { } } /* 映射字段 */,
    value: { type: Object, default: () => { } }
  },
  data() {
    return {
      fApi: {},
      rule: [],
      option: {
        submitBtn: false,
        resetBtn: false,
        row: { gutter: 12 },
        col: { span: 6 },
        info: { type: 'popover' },
        form: { labelPosition: 'right', size: 'small', labelWidth: '90px' }
      },
      defaultProps: {
        type: 'fieldType',
        field: 'fieldName',
        title: 'showName',
        options: 'valueList',
        hidden: 'hidden',
        ...this.fieldProps
      }
    };
  },
  watch: {
    searchList: {
      handler() {
        this.getRules();
      },
      immediate: true
    },
    value: {
      handler(val) {
        this.$nextTick(() => {
          val && this.fApi.setValue(val);
        });
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /* 获取渲染规则 */
    getRules() {
      const fieldType = this.getFieldType();
      this.rule = this.searchList.map(m => {
        const defaultConfig = this.defaultConfig.find(f => f.field == m[this.defaultProps.field]) || {};
        const item = { ...m, ...defaultConfig };
        return this.getRulesItem(item, fieldType);
      });
    },
    getRulesItem(m, fieldType) {
      const { type, field, title, options, hidden } = this.defaultProps;
      const ft = fieldType[m[type] || '0'];
      const props = m.props || {};
      const item = {
        type: ft.type,
        field: m[field],
        title: {
          native: true,
          children: [{ type: 'wToolTip', props: { content: m[title], placement: 'top' } }]
        },
        value: m.value || ft.value ,
        options: m[options] || m.dictionary,
        hidden: m[hidden],
        col: m.col || { span: 6 },
        props: {
          ...ft.props,
          placeholder: ft.props.placeholder + m.showName,
          ...props,
          data: m[options] || props.data || []
        },
        on: m.on
      };
      ft.directives && (item.directives = ft.directives(this, item.field));
      return item;
    },
    /* 标记对应字段类型 */
    getFieldType() {
      return {
        '0': {
          label: '文本',
          type: 'input',
          value: '',
          props: { type: 'text', placeholder: '请输入' }
        },
        '1': {
          label: '整数',
          type: 'input',
          value: '',
          directives(that, field) {
            return [
              { name: 'blur', arg: 'price', value: value => that.fApi && that.fApi.setValue({ [field]: value }) }
            ];
          },
          props: { type: 'number', placeholder: '请输入' }
        },
        '2': {
          label: '下拉',
          type: 'select',
          value: '',
          props: { placeholder: '请选择', clearable: true }
        },
        '3': {
          label: '日期',
          type: 'DatePicker',
          value: null,
          props: { type: 'date', format: 'yyyy-MM-dd', placeholder: '请选择' }
        },
        '4': {
          label: '日期时间',
          type: 'DatePicker',
          value: null,
          props: { type: 'datetime', format: 'yyyy-MM-dd HH:mm:ss', placeholder: '请选择' }
        },
        '5': {
          label: '小数',
          type: 'input',
          value: '',
          directives(that, field) {
            return [
              { name: 'blur', arg: 'price', value: value => that.fApi && that.fApi.setValue({ [field]: value }) }
            ];
          },
          props: { type: 'number', placeholder: '请输入' }
        },
        '6': {
          label: '年份',
          type: 'DatePicker',
          value: null,
          props: { type: 'year', format: 'yyyy', valueFormat: 'yyyy', placeholder: '请选择' }
        },
        '7': {
          label: '单位自定义下拉',
          type: 'select',
          value: '',
          props: { placeholder: '请选择', clearable: true }
        },
        '9': {
          label: '文件',
          type: 'input',
          value: null,
          props: { placeholder: '请选择' }
        },
        '10': {
          label: '自定义接口',
          type: 'wTreeSelectMult',
          value: [],
          props: { placeholder: '请输入', data: [] }
        },
        '11': {
          label: '单选树',
          type: 'wTreeSelectSingle',
          value: '',
          props: { placeholder: '请输入', data: [] }
        },
        '13': {
          label: '图片',
          type: 'input',
          value: '',
          props: { placeholder: '请输入' }
        },
        '14': {
          label: '多张图片',
          type: 'input',
          value: [],
          props: { placeholder: '请输入' }
        },
        '15': {
          label: '日期时间范围',
          type: 'DatePicker',
          value: null,
          props: {
            type: 'datetimerange',
            format: 'yyyy-MM-dd HH:mm:ss',
            'default-time': ['00:00:00', '23:59:59'],
            startPlaceholder: '开始时间',
            endPlaceholder: '结束时间'
          }
        },
        /**
         *  如：身份证号为输入框，但需多个身份证号输入
         * 字段配置相关后端无需更改类型，由前端自行更改；
         * 非字段配置的，可由后端返回，也可自行更改
         */
        '16': {
          label: '多行输入',
          type: 'multiInput',
          value: [],
          props: {}
        },
        /* 密码类型 */
        '17': {
          label: '密码',
          type: 'input',
          value: '',
          props: { type: 'password', placeholder: '请输入' }
        },
      };
    },
    /* 手动更新数据 */
    updateData(data, isMerge) {
      const fieldType = this.getFieldType();
      if (isMerge) {
        /* 批量更新 */
        let info = {};
        for (const key in data) {
          let item = this.rule.find(f => f.field == key);
          info[key] = this.getRulesItem({ ...item, ...data[key] }, fieldType);
        }
        this.fApi.mergeRules(info);
      } else {
        const field = data[this.defaultProps.field];
        const item = this.rule.find(f => f.field == field) || {};
        const columns = this.searchList.find(f => f.field == field) || {};
        const ruleData = {
          ...item,
          ...columns,
          ...data,
          props: { ...(item.props || {}), ...(data.props || {}) },
          on: { ...(item.on || {}), ...(data.on || {}) }
        };
        this.fApi.updateRule(field, this.getRulesItem(ruleData, fieldType));
      }
    },
    onChange() {
      this.$emit('change', arguments[3].form);
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep .el-upload-list__item {
  width: 100px;
  height: 100px;
}
::v-deep .el-upload--picture-card {
  width: 100px;
  height: 100px;
}
</style>
