<script>
export default {
  name: 'wTable',
  props: {
    // 表格的列信息
    columns: {
      type: Array,
      default: () => [],
      required: true
    },
    // 表格数据信息
    dataSource: {
      type: Array,
      default: () => [],
      required: true
    },
    // 分页
    pagination: {
      type: [Boolean, Object],
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: ''
    },
    hideOverflowTooltip: {
      type: Boolean,
      default: false
    }
  },
  render() {
    const props = {
      ...this.$attrs,
      ...this.$props,
      ...{
        'header-cell-style': { 'text-align': 'center' },
        data: this.dataSource,
      },
    }
    const on = {
      ...this.$listeners
    }
    return (
      <div class="wTableContainer">
        <el-table
          ref="table"
          v-loading={this.loading}
          element-loading-text={this.loadingText || "加载中，请稍后..."}
          element-loading-spinner="el-icon-loading"
          border
          style='width: 100%'
          class="w-table"
          props={props}
          on={on}
        >
          {this.renderTableColumn()}
        </el-table>
        {this.renderPagination()}
      </div>
    )
  },
  methods: {
    renderTableColumn() {
      return this.columns.filter(f => !f.hidden).map(item => {
        return (
          <el-table-column
            show-overflow-tooltip={!this.hideOverflowTooltip}
            props={item}
            align={item.align || 'center'}
            scopedSlots={item.render ? { default: ({ row, $index }) => item.render(row, $index) } : { default: this.$scopedSlots[item.slotName] }}
          />
        )
      })
    },
    renderPagination() {
      if (this.pagination) {
        const props = {
          'current-page': this.pagination.page,
          'page-size': this.pagination.limit,
          'pager-count': 5,
          ...this.pagination,
        }
        const on = {
          ...this.pagination.on,
          'size-change': (pageSize) => {
            this.pagination.on.paginationChange({ page: 1, limit: pageSize })
          },
          'current-change': (currentPage) => {
            this.pagination.on.paginationChange({ page: currentPage, limit: props.limit })
          }
        }
        return <el-pagination
          class='is-background pagination'
          layout="total, sizes, prev, pager, next, jumper"
          page-sizes={this.pagination.pageSizes || [10, 20, 30, 50, 100, 300]}
          props={props}
          on={on}
        />
      }
    },
    doLayout() {
      this.$refs.table.doLayout()
    }
  }
}
</script>
