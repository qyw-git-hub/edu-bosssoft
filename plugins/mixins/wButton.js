export default {
  props: {
    limit: {
      type: String,
      default: ''
    },
    isLink: Boolean, // 是否不要边框
    permission: {
      // 权限名称，直接传进来
      type: String,
      default: ''
    },
  },
  data() {
    return {
      loading: false
    };
  },
  methods: {
    getLimit() {
      const _data = {
        default: { icon: '', className: 'list-btn' },
        add: { type: 'primary', label: '添加', icon: 'el-icon-plus', className: 'list-btn' },
        edit: { type: 'primary', label: '修改', icon: 'el-icon-edit', className: 'list-btn' },
        view: { type: 'default', label: '详情', icon: 'el-icon-view', className: 'list-btn' },
        query: { type: 'primary', label: '查询', icon: 'el-icon-search', className: 'list-btn' },
        save: { type: 'primary', label: '保存', icon: 'el-icon-document', className: 'list-btn' },
        delete: { type: 'danger', label: '删除', icon: 'el-icon-delete-solid', className: 'list-btn' },
        import: { type: 'primary', label: '导入', icon: 'el-icon-upload2', className: 'list-btn' },
        download: { type: 'primary', label: '下载', icon: 'el-icon-download', className: 'list-btn' },
        export: { type: 'primary', label: '导出', icon: 'el-icon-download', className: 'list-btn' },
        reported: { type: 'warning', label: '上报', icon: 'el-icon-s-promotion', className: 'list-btn' },
        tools: { type: 'warning', label: '权限', icon: 'el-icon-setting', className: 'list-btn' },
        sell: { type: 'primary', label: '上架', icon: 'el-icon-sell', className: 'list-btn' },
        'sell-out': { type: 'primary', label: '下架', icon: 'el-icon-sold-out', className: 'list-btn' },
        cancelreg: { type: 'primary', label: '取消', icon: 'el-icon-folder-delete', className: 'list-btn' },
        syschild: { type: 'primary', label: '同步', icon: 'el-icon-d-caret', className: 'list-btn' },
        submit: { type: 'primary', label: '提交', icon: '', className: 'list-btn' },
        cancel: { type: 'default', label: '取消', icon: '', className: 'list-btn' },
        check: { type: 'primary', label: '审核', icon: 'el-icon-user', className: 'list-btn' },
        confirm: { type: 'primary', label: '确认', icon: 'el-icon-document-checked', className: 'list-btn' },
        setting: { type: 'primary', label: '配置', icon: 'el-icon-s-tools', className: 'list-btn' },
        exchange: { type: 'warning', label: '调课', icon: 'el-icon-set-up', className: 'list-btn' },
        /* 列表按钮*/
        'table-btn': { size: 'mini', className: 'table-btn' },
        'table-view': { type: 'default', label: '查看', icon: 'el-icon-view', size: 'mini', className: 'table-btn' },
        'table-edit': { type: 'primary', label: '编辑', icon: 'el-icon-edit', size: 'mini', className: 'table-btn' },
        'table-setting': {
          type: 'primary',
          label: '配置',
          icon: 'el-icon-setting',
          size: 'mini',
          className: 'table-btn'
        },
        'table-list': { type: 'primary', label: '列表', icon: 'el-icon-tickets', size: 'mini', className: 'table-btn' },
        'table-tools': {
          type: 'warning',
          label: '权限',
          icon: 'el-icon-setting',
          size: 'mini',
          className: 'table-btn'
        },
        'table-download': {
          type: 'success',
          label: '下载',
          icon: 'el-icon-download',
          size: 'mini',
          className: 'table-btn'
        },
        'table-import': {
          type: 'primary',
          label: '下载',
          icon: 'el-icon-upload2',
          size: 'mini',
          className: 'table-btn'
        },
        'table-printer': {
          type: 'primary',
          label: '打印',
          icon: 'el-icon-printer',
          size: 'mini',
          className: 'table-btn'
        },
        'table-reported': {
          type: 'warning',
          label: '上报',
          icon: 'el-icon-s-promotion',
          size: 'mini',
          className: 'table-btn'
        },
        'table-check': { type: 'primary', label: '审核', icon: 'el-icon-user', size: 'mini', className: 'table-btn' },
        'table-sell': { type: 'primary', label: '上架', icon: 'el-icon-sell', size: 'mini', className: 'table-btn' },
        'table-sell-out': {
          type: 'primary',
          label: '下架',
          icon: 'el-icon-sold-out',
          size: 'mini',
          className: 'table-btn'
        },
        'table-delete': { type: 'danger', label: '删除', icon: 'el-icon-delete', size: 'mini', className: 'table-btn' },
        'table-confirm': { type: 'primary', label: '确定', icon: 'el-icon-bell', size: 'mini', className: 'table-btn' },
        'table-data': {
          type: 'primary',
          label: '设置日期',
          icon: 'el-icon-date',
          size: 'mini',
          className: 'table-btn'
        },
        'table-close': {
          type: 'danger',
          label: '取消',
          icon: 'el-icon-circle-close',
          size: 'mini',
          className: 'table-btn'
        },
        /* 搜索按钮*/
        search: { type: 'primary', label: '搜索', icon: 'el-icon-search', size: 'small' },
        refresh: { type: 'default', label: '重置', icon: 'el-icon-refresh', size: 'small' },
        /* 列表头部按钮*/
        'list-add': { type: 'primary', label: '新增', icon: 'el-icon-plus', size: 'small', className: 'list-btn' },
        'list-export': {
          type: 'primary',
          label: '导出',
          icon: 'el-icon-download',
          size: 'small',
          className: 'list-btn'
        },
        /* 无边框按钮 */
        'islink-default': { size: 'medium', className: 'is-link', plain: true },
        'islink-primary': { size: 'medium', type: 'primary', className: 'is-link', plain: true },
        'islink-save': {
          type: 'primary',
          label: '保存',
          icon: 'el-icon-document',
          size: 'medium',
          className: 'is-link',
          plain: true
        },
        'islink-edit': {
          type: 'primary',
          label: '编辑',
          icon: 'el-icon-edit',
          size: 'medium',
          className: 'is-link',
          plain: true
        },
        'islink-delete': {
          type: 'danger',
          label: '删除',
          icon: 'el-icon-delete',
          size: 'medium',
          className: 'is-link',
          plain: true
        },
        /* info按钮 */
        'info-default': { type: 'info', label: '', icon: '', className: 'list-btn list-btn-info' },
        'info-export': { type: 'info', label: '导出', icon: 'el-icon-download', className: 'list-btn list-btn-info' },
        'info-import': { type: 'info', label: '导入', icon: 'el-icon-upload2', className: 'list-btn list-btn-info' },
        'info-refresh': { type: 'info', label: '重置', icon: 'el-icon-refresh', className: 'list-btn list-btn-info' },
        /* 虚线边框按钮 */
        'd-default': { icon: '', className: 'd-btn' }
      };
      return _data[this.limit] || {};
    },
    initRender(_className) {
      const { type, label, icon, size = 'small', className = '', plain } = this.getLimit();
      const props = {
        type,
        size,
        icon,
        plain,
        loading: this.loading,
        ...this.$attrs
      };
      const on = this.$listeners;
      return [
        <el-button class={['wButton', className, this.isLink && 'is-link', _className]} props={props} on={on}>
          {this.$slots.default || <span>{label}</span>}
        </el-button>
      ]
    }
  }
};
