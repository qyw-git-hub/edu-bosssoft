import { toThousands } from '../utils/common.js'
class filterHeaders {
  constructor() {
    this.$atts = {}
    this.rules = []
    this.dicts = {}
    this.requestData = {}
  }
  /* 规则校验，并提示错误*/
  validateAttrs(attrs) {
    // console.log(attrs)
    if (attrs.isAuto && !(attrs.interfaceUrl || attrs.interfaceRequest)) {
      console.error('当开启isAuto时，interfaceUrl或interfaceRequest不能为空')
    }
    if (attrs.rules && attrs.rules.some(s => !s.to)) {
      console.error(`请在规则中${name}属性传入to: 'list | search'，否则将无法识别到应用区域。`)
    }
  }
  /* 获取规则 */
  getRules(name, to) {
    return this.rules.find(f => f.type == name && (f.to || []).includes(to)) || {}
  }

  /* 筛序规则 */
  filterRules(name, to) {
    return this.rules.filter(f => f.type == name && f.to.includes(to))
  }

  /* 递归树绑定值 */
  filterTreeNode(data, mapping) {
    const { label, value, children } = mapping
    const method = (tree) => {
      tree.forEach(e => {
        e.label = e[label]
        e.value = e[value]
        if (e[children] && e[children].length) {
          e.children = e[children]
          method(e[children])
        }
      });
    }
    method(data || [])
    return data
  }

}

class listField extends filterHeaders {
  constructor() {
    super()

    /* 筛选头列表字段对照 */
    this.defaultProps = {
      field: 'field',
      title: 'title',
      width: 'width',
      height: 'height',
      visible: 'visible',
      fixed: 'fixed'
    }
    this.interfaceProps = {
      field: 'fieldName',
      title: 'showName',
      width: 'columnWidth',
      height: 'rowHeight',
      visible: 'display',
      fixed: 'regular'
    }

    this.fieldInfo = {}
  }

  /* 获取基础props */
  getDefaultProps(data) {
    return { ...this.defaultProps, ...(data || {}) }
  }

  /* 继承父类getRules方法，抛出外部使用 */
  getRules(name) {
    return super.getRules(name, 'list')
  }

  /* 继承父类filterRules方法，抛出外部使用 */
  filterRules(name) {
    return super.filterRules(name, 'list')
  }

  /* 格式化数据 */
  formatData(m, fieldProps) {
    let data = {}
    for (const key in fieldProps) {
      data[key] = m[fieldProps[key]]
    }
    return data
  }
  filterInsertType(rules, list) {
    const fields = { unshift: [], push: [], uData: [], pData: [] }
    rules.forEach(e => {
      if (e.type == 'filter' && !e.isShow) {
        fields[e.insert] = (fields[e.insert] || []).concat(...e.field)
      }
    });
    list.forEach(f => {
      fields.unshift.includes(f.field || f.fieldName) && fields.uData.push(f)
      fields.push.includes(f.field || f.fieldName) && fields.pData.push(f)
    })
    return { uData: fields.uData, pData: fields.pData }
  }
  /* 通过规则插入给list */
  insertDataByRules(rules, list) {
    rules.forEach(e => {
      switch (e.insert) {
        case 'unshift':
          list.unshift(...e.fieldNodes)
          break;
        case 'push':
          list.push(...e.fieldNodes)
          break;
        default:
          break;
      }
    })
    return list
  }

  /* 插槽规则 */
  limitSlotRules(slotRules, formatterRules, item, _field, m) {
    const field = m[_field]
    const slotsData = slotRules.data || {}
    const formatterData = formatterRules.data || {}
    if (m.dictionary) { /* 字典 */
      formatterData[field] = this.dicts[m.dictionary]
    } else if (this.requestData[field]) { /* 单独请求 */
      formatterData[field] = this.requestData[field]
    } else if (m.fieldType == '5') { /* 小数，保留小数点 */
      item.formatter = ({ cellValue }) => {
        return toThousands(cellValue)
      }
    }

    /* 判断是否有规则 */
    if (slotsData[field] || m.imageNodes) { /* m.imageNodes 图片 或 有传入插槽情况 */
      item.slots = slotsData[field] || m.imageNodes
    }
    if (formatterData[field]) {
      item.formatter = ({ cellValue }) => {
        const values = formatterData[field] || []
        let label = ''
        const filter = (data) => {
          data.forEach(e => {
            e.value == cellValue && (label = e.label)
            if (e.children && e.children.length) {
              filter(e.children)
            }
          });
        }
        filter(values)
        return label
      }
      item.extends = formatterData[field]
    }
  }

  /* 过滤规则 */
  limitFilterRules(rules, item, field) {
    const ruleItem = rules.find(f => f.field.includes(item[field]))
    let filterField = []
    if (rules.length && ruleItem) {
      ruleItem.isShow && ruleItem.fieldNodes.push({ ...item, isHide: true })
      filterField.push(item.field)
    }
    return filterField
  }

  /* 获取默认值 */
  getFieldInfo() {
    return this.fieldInfo
  }

  /* 转换成表格所需格式 */
  afterInitField(data, fieldProps) {
    const list = this.initField(data, fieldProps)
    return this.beforeSubmit(list, fieldProps)
  }
  /* 获取对齐规则 */
  getAlignRules() {
    let alignRules = this.filterRules('align').map(m => m.field)
    return [].concat(...alignRules)
  }
  /* 获取对齐方式规则 */
  setAlignRules(rules, field) {
    let align = 'center'
    if (rules.length && rules.includes(field)) {
      let alignRules = this.filterRules('align')
      alignRules.forEach(f => {
        if (f.field.includes(field)) {
          align = f.trigger
        }
      })
    }
    return align
  }

  /* 表头重命名规则 */
  renameSlotRules(renameRules, item) {
    if (renameRules.length) {
      const renameItem = renameRules.find(f => f.field == item.field)
      if (renameItem) {
        item.title = renameItem.data || item.title
        if (renameItem.prefix) {
          item.titlePrefix = renameItem.prefix
          item.headerClassName = 'titlePrefix'
        } else if (renameItem.suffix) {
          item.titlePrefix = renameItem.suffix
          item.headerClassName = 'titleSuffix'
        }
      }
    }
  }

  /* 转换成弹窗所需格式 */
  initField(data = [], fieldProps) {
    let _list = []
    let { visible, fixed, field, height } = fieldProps
    /* 获取过滤规则 */
    let filterRules = this.filterRules('filter').map(m => ({ ...m, fieldNodes: [] }))
    /* 获取插槽规则 */
    let slotRules = this.getRules('slot')
    /* 获取重命名规则 */
    let renameRules = this.filterRules('rename')
    /* 获取列宽规则 */
    let colwidthRule = this.getRules('colwidth')
    /* 格式化规则 */
    let formatterRules = this.getRules('formatter')
    /* 获取对齐方式规则 */
    let alignRules = this.getAlignRules()
    /* 获取过滤视图内的字段 */
    const filterViewerRules = (this.getRules('filterViewer') || {}).field || []
    data.forEach(m => {
      const item = {
        ...m,
        ...this.formatData(m, fieldProps),
        minWidth: colwidthRule.data && colwidthRule.data[m[field]] || (m.minWidth || '150px'),
        height: m[height] && String(m[height]) || '40',
        visible: filterViewerRules.includes(m[field]) ? false : typeof m[visible] == 'boolean' ? m[visible] ? '1' : '0' : m[visible] || '0',
        fixed: (m[fixed] == '0' || m[fixed] == '1') ? m[fixed] : Boolean(m[fixed]) ? '1' : '0',
        align: this.setAlignRules(alignRules, m[field]),/* 对齐方式规则 */
        isShow: true
      }

      /* 重命名规则 */
      this.renameSlotRules(renameRules, item)

      /* 插槽规则判定 */
      this.limitSlotRules(slotRules, formatterRules, item, field, m)

      /* 过滤规则 */
      const filterData = this.limitFilterRules(filterRules, item, field)
      if (!filterData.includes(item.field)) {
        _list.push(item)
      }

    });
    this.insertDataByRules(filterRules, _list)
    return _list
  }

  /* 提交之前处理数据 */
  beforeSubmit(data, fieldProps) {
    let showData = []
    let hiddenData = []
    this.fieldInfo = {}
    data.forEach((m, i) => {
      for (const key in fieldProps) {
        /* 给映射字段赋值 */
        m[fieldProps[key]] = m[key]
      }
      const item = {
        ...m,
        height: data[0].height,
        visible: m.visible == '1',
        /* 处理是否显示 */
        fixed: m.fixed == '1' ? 'left' : '',
        /* 处理fixed对齐 */
        orderNo: i + 1
      }
      item.visible == '1' ? showData.push(item) : hiddenData.push(item)
      item.visible == '1' && (this.fieldInfo[m.field] = m.defaultValue || undefined)
    })
    return [...showData, ...hiddenData]
  }
}

class searchField extends filterHeaders {
  constructor() {
    super()
    this.fieldInfo = {}
    /* 筛选头列表字段对照 */
    this.defaultProps = { field: 'field', title: 'title', visible: 'visible' }
    this.interfaceProps = { field: 'fieldName', title: 'showName', visible: 'display' }
  }

  /* 获取基础props */
  getDefaultProps(data) {
    return { ...this.defaultProps, ...(data || {}) }
  }

  /* 继承父类getRules方法，抛出外部使用 */
  getRules(name) {
    return super.getRules(name, 'search')
  }

  /* 继承父类filterRules方法，抛出外部使用 */
  filterRules(name) {
    return super.filterRules(name, 'search')
  }

  /* 获取默认值 */
  getFieldInfo() {
    return this.fieldInfo
  }

  /* 获取extends下拉内容 */
  getExtendsInfo(m, field) {
    const formatterRules = this.getRules('formatter')
    if (formatterRules && formatterRules.data && formatterRules.data[m[field]]) {
      return formatterRules.data[m[field]]
    } else if (this.requestData[m[field]]) {
      return this.requestData[m[field]]
    }
    return this.dicts[m.dictionary]
  }
  getShowName(field, value) {
    let rename = value
    /* 获取重命名规则 */
    let renameRules = this.filterRules('rename')
    if (renameRules.length) {
      const renameItem = renameRules.find(f => f.field == field)
      if (renameItem) rename = renameItem.data
    }
    return rename
  }
  /* 初始化之后 */
  afterInitField(data, fieldProps) {
    const list = this.initField(data, fieldProps)
    return this.beforeSubmit(list, fieldProps)
  }
  /* 初始化转换成弹窗内所需格式 */
  initField(data = [], fieldProps) {
    let _list = []
    const { field, title, visible } = fieldProps
    const slotRules = this.getRules('slot')
    const filterViewerRules = (this.getRules('filterViewer') || {}).field || []
    data.forEach(m => {
      const item = {
        ...m,
        field: m[field],
        title: m[title],
        showName: this.getShowName(m[field], m[title]),
        visible: typeof m[visible] == 'boolean' ? m[visible] ? '1' : '0' : m[visible] || '0',
        hidden: filterViewerRules.includes(m[field]) ? true : m[visible] != '1',
        extends: this.getExtendsInfo(m, field),
        isShow: true,
        ...(slotRules.data ? slotRules.data[m[field]] : {})
      }
      _list.push(item)
    });
    return _list
  }

  /* 提交之前处理数据 */
  beforeSubmit(data, fieldProps) {
    const showData = []
    const hiddenData = []
    this.fieldInfo = {}
    data.forEach((m, i) => {
      for (const key in fieldProps) {
        /* 给映射字段赋值 */
        m[fieldProps[key]] = m[key]
      }
      const item = {
        ...m,
        visible: m.visible == '1',
        hidden: m.visible != '1',
        orderNo: i + 1
      }
      item.visible == '1' ? showData.push(item) : hiddenData.push(item)
      item.visible == '1' && (this.fieldInfo[m.field] = undefined)
    })
    return [...showData, ...hiddenData]
  }
}

export const classListField = new listField()
export const classSearchField = new searchField()
export default new filterHeaders()
