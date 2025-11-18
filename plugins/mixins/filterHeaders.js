import { deepClone, getUser } from '../utils/common.js'
import classFilter, { classListField, classSearchField } from '../utils/filterHeadersClass.js'
export default {
  components: {
    wDialog: () => import('../components/wDialog/index.vue'),
    wSwitch: () => import('../components/wSwitch.vue'),
    vuedraggable: () => import('vuedraggable'),
    filedView: () => import('../components/wDialog/filedView.vue')
  },

  props: {
    /* 列表表头字段 */
    columns: {
      type: Array,
      required: true,
      default: () => []
    },
    /* 筛选条件表头字段 */
    searchColumns: {
      type: Array,
      required: true,
      default: () => []
    },
    /* 请求request */
    interfaceRequest: {
      type: Object,
      default: () => ({})
    },
    /* 请求接口url */
    interfaceUrl: {
      type: String,
      default: ''
    },
    /* 请求接口参数 */
    interfaceParams: {
      type: Object,
      default: () => {
        return { configurationType: '01' }
      }
    },
    /* 基本规则 */
    limitRuleName: {
      type: String,
      default: ''
    },
    /* 过滤规则 */
    rules: {
      type: Array,
      default: () => []
    },
    /* 映射字段 */
    defaultProps: {
      type: Object,
      default: () => { return { list: {}, search: {} } }
    },
    /* 是否自动开启请求接口 */
    isAuto: {
      type: Boolean,
      default: false
    },
    /* 是否固定筛选表头图标 */
    iconInline: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      deptId: getUser().deptId,
      loading: false,
      visible: false,
      currentTab: 'list',
      dialogParams: { title: '列表设置', width: '902px', loading: false, submitText: '保存', loading_submit: false },
      fieldProps: classListField.getDefaultProps(this.defaultProps.list),
      searchProps: classSearchField.getDefaultProps(this.defaultProps.search),
      listHeaders: [
        {
          label: '拖拽排序',
          width: '80px',
          type: 'drag'
        },
        {
          label: '表格列名称',
          field: 'title',
          width: '172px',
          type: 'text'
        },
        {
          label: '列宽(100~500)',
          field: 'width',
          width: '162px',
          type: 'number'
        },
        {
          label: '行高',
          field: 'height',
          width: '162px',
          type: 'select',
          colspan: true,
          style: { 'border-bottom': 0 }
        },
        {
          label: '是否显示',
          field: 'visible',
          width: '142px',
          type: 'switch',
          activeText: '显示',
          inactiveText: '隐藏',
        },
        {
          label: '是否固定',
          field: 'fixed',
          width: '142px',
          type: 'switch',
          activeText: '是',
          inactiveText: '否',
        }
      ],
      searchHeaders: [
        {
          label: '拖拽排序',
          width: '80px',
          type: 'drag'
        },
        {
          label: '搜索项名称',
          field: 'title',
          width: '398px',
          type: 'text'
        },
        {
          label: '是否显示',
          field: 'visible',
          width: '372px',
          type: 'switch',
          activeText: '显示',
          inactiveText: '隐藏',
        },
      ],
      list: [], /* 列表字段 */
      search: [],/* 筛选条件 */
      defaultList: [],
      defaultSearch: [],
      rowHeightList: [
        { label: '大（48px）', value: '48', name: 'large' },
        { label: '中（44px）', value: '44', name: 'medium' },
        { label: '小（40px）', value: '40', name: 'small' },
      ],
      dragOptions: {
        animation: 300,
        cancelBubble: true,
        forceFallback: true,
        handle: '#tr_td_drag',
        chosenClass: 'chosenClass',
        ScrollSensitivity: 50,

      },
      dictionaryData: {}, /* 字典集合 */
      requestData: {}, /* 自定义请求集合 */
      requestRules: [],
      requestReplaceData: {},
      defaultReplaceData: {},
      filesParams: {
        visible: false,
        list: []
      },
    }
  },
  computed: {
    headers() {
      return this[this.currentTabItem.headerName].filter(f => !f.isHide)
    },
    currentTabItem() {
      return {
        'list': { value: '1', title: '列表字段', headerName: 'listHeaders', methodName: 'initListField' },
        'search': { value: '2', title: '筛选条件', headerName: 'searchHeaders', methodName: 'initListSearch' }
      }[this.currentTab]
    },
    tableList: { /* 显示列表 */
      set(value) {
        this[this.currentTab] = value
      },
      get() {
        return this[this.currentTab].filter(f => !f.isHide)
      }
    },
    /* 集成默认规则和传入规则 */
    mergeRules() {
      const limit = {
        student: [ /* 默认学生规则 */
          { type: 'fixed_disable', to: 'list', field: ['clazz'] },
          { type: 'filter', to: 'list', field: ['checkbox'], insert: 'unshift', isShow: false },
          { type: 'filter', to: 'list', field: ['operator', 'grade'], insert: 'push', isShow: false }
        ]
      }
      return this.limitRuleName ? [...limit[this.limitRuleName], ...this.rules] : deepClone(this.rules)
    },
    dispatch() {
      return {
        update: (listField, listSearch) => {
          const _listField = this.replaceField(listField, true)
          this.$emit('update', _listField, listSearch)
          this.$emit('getBaseColumns', this.replaceField(_listField, false))
          this.$emit('getValue', classListField.getFieldInfo(), classSearchField.getFieldInfo(), this.getFieldInfo)
        },
        init: () => {
          this[this.currentTabItem.methodName](false)
        },
      }
    },
    /* 父组件手动调用内部方法汇总 */
    dispatchEvent() {
      return {
        /* 手动替换 */
        replaceField: (columns, field, data) => {
          return this.replaceFieldToChild(columns, field, data)
        },
        /* 手动再次请求 */
        replayRequest: (rules, columns) => {
          return this.replayRequest(rules, columns)
        }
      }
    }
  },
  async created() {
    /* 校验字段格式 */
    classFilter.validateAttrs({ ...this.$attrs, ...this.$props })

    /* 规则存储 */
    classListField.rules = this.mergeRules
    classSearchField.rules = this.mergeRules

    /* 请求所有接口 */
    await this.getInterfaceData()

    /* 初始化 */
    await this.initData()
  },
  methods: {
    async initData() {
      if (this.isAuto) {
        await this.initListField(true)
        await this.initListSearch()
        this.dispatch.update(this.list, this.search)
      }
    },
    /* 打开列表设置弹窗 */
    onOpenDialog() {
      this.dispatch.init()
      this.currentTab = 'list'
      this.visible = true
    },
    /* 获取配置接口 */
    async requestTableHeaderConfig(type) {
      let res = {}
      const data = { deptId: this.deptId, path: this.interfaceUrl, type, ...this.interfaceParams }
      res = this.interfaceRequest.query ? await this.interfaceRequest.query(data) : await this.getTableHeaderConfig(data)
      if (res.code == 1000) {
        let data = res.result
        if (type == 1) data = this.setFile(type, res.result)
        await this.getDictData(data)
        return data
      } else {
        this.$wTips.error(res.message)
      }
    },
    /* 处理图片/文件 */
    setFile(type, data) {
      if (type == 1) {
        const img_type = ['13', '14'] /* 图片集合 */
        const file_type = ['9'] /* 文件集合 */
        data.forEach(f => {
          if ([...img_type, ...file_type].includes(f.fieldType)) {
            const showtxt = img_type.includes(f.fieldType) ? '图片' : '附件'
            f.imageNodes = {
              default: ({ row }) => {
                let value = row[f[this.fieldProps.field]]
                return value ? [
                  <w-button
                    limit="table-view"
                    style="background: #4254ff; color: #fff; border-radius: 30px"
                    on={{
                      click: () => {
                        this.showFile(value)
                      }
                    }}
                  >
                    查看{showtxt}
                  </w-button>
                ] : '暂无' + showtxt
              },
            }
          }
        })
      }
      return data
    },
    async showFile(value) {
      if (/(fileName)|(http:\/\/)|(https:\/\/)/.test(value)) {
        value = /fileName/.test(value) ? JSON.parse(value) : value
      } else {
        const { code, result, message } = await this.findFiles(value)
        value = result
        code != 1000 && this.$wTips.error(message)
      }
      if (value) {
        this.filesParams.list = Array.isArray(value) ? value : [{ fileName: '附件', fileUrl: value }]
        this.filesParams.visible = true
      }
    },
    /* 处理字典 */
    async getDictData(data) {
      /* 2数据字典，7单位字典 */
      let dict_rule = (this.mergeRules.find(f => f.type == 'dictionary' && f.dictType == '2') || {}).data || []
      let dictDept_rule = (this.mergeRules.find(f => f.type == 'dictionary' && f.dictType == '7') || {}).data || []
      const dicts = Object.keys(this.dictionaryData)
      let dict_list = dict_rule.filter(f => !dicts.includes(f))
      let dictDept_list = dictDept_rule.filter(f => !dicts.includes(f))
      let dictDept_top_list = []

      data.forEach(f => {
        const isHave = dicts.includes(f.dictionary)
        if (!isHave && f.dictionary) {
          f.fieldType == '2' && dict_list.push(f.dictionary)
          if (f.fieldType == '7') {
            f.isBestDeptDictionary == '1' ? dictDept_top_list.push(f.dictionary) : dictDept_list.push(f.dictionary)
          }
        }
      })

      if (dict_list.length || dictDept_list.length) {
        const dict_res = dict_list.length && await this.listDictDataMaps(dict_list) || { result: {} }
        const dictDept_res = dictDept_list.length && await this.listDictDeptDataMaps({ dictTypes: dictDept_list, deptId: this.deptId }) || { result: {} }
        const dictDept_top_res = dictDept_top_list.length && await this.listDictDeptDataMaps({ dictTypes: dictDept_top_list, deptId: this.deptId, isBestDeptDictionary: '1' }) || { result: {} }
        this.dictionaryData = { ...this.dictionaryData, ...dict_res.result, ...dictDept_res.result, ...dictDept_top_res.result }
        classListField.dicts = this.dictionaryData
        classSearchField.dicts = this.dictionaryData
        this.$emit('getAllDict', this.dictionaryData)
      }
    },
    /* 提取请求接口方法公共使用 */
    async staticRequest(rules) {
      if (rules.length) {
        const request = rules.map(m => m.url(m.params))
        await Promise.all(request).then(results => {
          results.forEach((res, i) => {
              const backdirectory = rules[i].backdirectory
              const data = (backdirectory ? res.result[backdirectory] : res.result) || []
              if (res.code == 1000) {
              const ruleMapping = rules[i].mapping || {}
              const mapping = { label: 'label', value: 'value', children: 'children', ...ruleMapping }
              const filterData = classFilter.filterTreeNode(data, mapping)
              if (rules[i].type == 'replace') { /* 若type:replace则为需要替换字段，避免重复则放到另外一个集合中 */
                this.requestReplaceData[rules[i].field] = filterData
                if (rules[i].toField) { /* 若有toField字段，则将requestData数据放到此字段名里 */
                  this.requestData[rules[i].toField] = filterData
                }
              } else {
                if (rules[i].field) {
                  this.requestData[rules[i].field] = filterData
                }
                rules[i].callback && rules[i].callback(filterData)
              }
            } else {
              this.requestData[rules[i].toField] = data
              this.$wTips.error(res.message)
            }
          });
          classListField.requestData = this.requestData
          classSearchField.requestData = this.requestData
        })
      }
    },
    /* 处理传递过来默认接口 */
    async getInterfaceData() {
      const list_rules = classListField.filterRules('interface')
      const search_rules = classSearchField.filterRules('interface')
      const replace_rules = classListField.filterRules('replace').filter(f => f.trigger == 'interface')
      const rules = list_rules
        .concat(search_rules)
        .concat(replace_rules)
        .filter(f => !this.requestData[f.field])
      this.requestRules = deepClone(rules)
      await this.staticRequest(rules)
      this.$emit('getAllRequest', this.requestData)
    },
    /* 手动请求 */
    replayRequest(rules, columns) {
      return new Promise(async (resolve) => {
        const requestFields = Object.keys(rules)
        const nRules = this.requestRules.filter(f => requestFields.includes(f.toField || f.field)).map(m => ({
          ...m,
          ...rules[m.field]
        }))
        await this.staticRequest(nRules)
        let rColumns = {}
        columns.forEach(f => {
          requestFields.includes(f.field) && (rColumns[f.field] = { ...f, extends: this.requestData[f.field] })
        })
        resolve({ result: this.requestData, columns: rColumns })
      })

    },
    /* 初始化列表字段内容 */
    async initListField(isInit) {
      let _columns = this.columns.filter(f => f.isShow)
      /* 判断传参方式，处理数据 */
      if (this.interfaceUrl && !this.list.length) {
        this.loading = true
        this.fieldProps = classListField.interfaceProps /* 修改映射字段 */
        _columns = await this.requestTableHeaderConfig(1)/* 请求接口 */
        this.loading = false
      }
      !isInit && (_columns = this.replaceField(_columns, false))
      this.list = classListField[isInit ? 'afterInitField' : 'initField'](_columns, this.fieldProps)
      this.defaultList = classListField.afterInitField(_columns, this.fieldProps)
    },
    /* 初始化筛选条件内容 */
    async initListSearch() {
      let _columns = this.searchColumns
      if (this.interfaceUrl && !this.search.length) {
        this.loading = true
        this.searchProps = classSearchField.interfaceProps /* 修改映射字段 */
        _columns = await this.requestTableHeaderConfig(2)
        this.loading = false
      }
      this.search = classSearchField.initField(_columns, this.searchProps)
      this.defaultSearch = classSearchField.afterInitField(_columns, this.searchProps)
    },
    /* 拖拽事件 */
    onMove(e) {
      if (this.currentTab == 'list') {
        const { futureIndex, element } = e.draggedContext
        let regularLen = this.list.filter(f => f.fixed == '1').length
        return element.fixed == '1' ? futureIndex < regularLen : futureIndex >= regularLen
      }
      return true
    },
    /* 切换Switch事件 */
    onChangeSwitch(row, field) {
      const fieldName = row.field
      const method = {
        fixed: () => { /* 执行是否固定的方法 */
          const fixedCount = classListField.getRules('fixed').count || 2 /* 固定数量，默认2 */
          const fixedDisable = classListField.getRules('fixed_disable')
          if (fixedDisable.field && fixedDisable.field.includes(fieldName)) {
            this.$wTips.error(`该字段不允许固定`)
            row[field] = '0'
          } else if (this.list.filter(f => f.fixed == '1').length > fixedCount) {
            this.$wTips.error('固定项最多只能开启' + fixedCount + '项')
            row[field] = '0'
          } else {
            const delIndex = this.list.findIndex(f => f.field == fieldName)
            this.$delete(this.list, delIndex)
            if (row[field] == '1') { /* 当选择是，进行删除并显示在首位 */
              this.list.unshift(row)
            } else { /* 否则回到未选择项中的首位 */
              let insertIndex = ''
              /* 当前索引值应为未选中项首位 */
              this.list.find((f, i) => !insertIndex && f[field] == '0' && (insertIndex = i))
              /* 解决最后一个选中状态的索引值不对 */
              if (delIndex == 0 && this.list.every(s => s[field] == '0')) {
                insertIndex = 0
              }
              this.list.splice(insertIndex, 0, row)
            }
          }
        },
        visible: () => {
          /* 列表字段显示数量，默认5 */
          const visibleCount = {
            list: classListField.getRules('visible').count || 5,
            search: classSearchField.getRules('visible').count || 1,
          }
          if (this[this.currentTab].filter(f => f.visible == '1').length < visibleCount[this.currentTab]) {
            this.$wTips.error('至少显示' + visibleCount[this.currentTab] + '项')
            row[field] = '1'
          }
          if (this.currentTab == 'list' && row[field] == '0') {
            row['fixed'] = '0'
          }
        }
      }
      method[field] && method[field]()
    },
    /* 手动替换规则 */
    replaceFieldToChild(columns, field, data) {
      let returnData = deepClone(columns)
      const past = JSON.stringify(returnData.filter(f => f.fieldStorage == field))
      const newData = JSON.stringify(data)
      if (data && data.length) {
        if (past != newData) {
          const rules = this.mergeRules.filter(f => f.type == 'filter' && !f.isShow)
          const { uData, pData } = classListField.filterInsertType(rules, returnData)
          const _columns = returnData.filter(f => f.isShow)
          let transData = this.replaceField(_columns, false)
          returnData = this.replaceField(transData, true)
          returnData = [...uData, ...returnData, ...pData]
        }
      }
      return returnData
    },
    /* 替换规则 */
    replaceField(listField, isTranslate) {
      let transData = deepClone(listField)
      /* 筛选出需要替换的字段 */
      let replaceRule = classListField.filterRules('replace')
      const that = this
      /* 渲染数据方法 */
      const getData = (e) => {
        const item = listField[e.index]
        return {
          interface() {
            const mapping = e.rule.mapping || {}
            return that.requestReplaceData[e.rule.field].map((m, i) => ({
              ...m,
              ...item,
              field: item.field + i,
              fieldStorage: item.field,
              title: m[mapping.title],
              slots: e.rule.slots && { default: ({ row }) => e.rule.slots(row, m) }
            }))
          },
          defined() {
            return e.rule.data.map(m => ({
              ...item,
              ...m,
              title: m.showName,
              field: m.fieldName,
              fieldStorage: m.fieldName,
              slots: m.slots && { default: ({ row }) => m.slots(row, m) }
            }))
          }
        }[e.rule.trigger]()
      }
      if (replaceRule.length) {
        if (isTranslate) { /* 判断转换方式，true为转成表格拆分格式，false转为合并格式 */
          let indexArr = []
          listField.forEach((e, i) => {
            const rule = replaceRule.find(f => f.field == e.field)
            if (rule) {
              let index = (rule.insert && rule.insert == 'push') ? (i + 1) : i
              indexArr.push({ index, rule, values: { ...e } })
            }
          })
          for (let i = indexArr.length - 1; i >= 0; i--) {
            const e = indexArr[i]
            const data = getData(e)
            transData.splice(e.index, e.rule.insert ? 0 : 1, ...data)
          }
          this.defaultReplaceData = indexArr
        } else {
          let filterField = []
          replaceRule.forEach(f => {
            if (f.insert) {
              const field = f.data.map(m => m.fieldName)
              filterField.push(...field)
            } else {
              filterField.push(f.field)
            }
          })
          transData = listField.filter(f => !(filterField.includes(f.fieldStorage)))
          if (this.defaultReplaceData.length) {
            this.defaultReplaceData.forEach(e => {
              if (!e.rule.insert) {
                transData.splice(e.index, 0, e.values)
              }
            });
          }
        }
      }
      return transData
    },
    /* 获取queryInfo回调 */
    getFieldInfo(data, searchData) {
      const base = classListField.getFieldInfo()
      const searchBase = classSearchField.getFieldInfo()
      for (const key in base) {
        base[key] = data[key]
      }
      for (const key in searchBase) {
        searchBase[key] = searchData[key]
      }

      return { mergeData: base, searchMergeData: searchBase }
    },
    /* 提交 */
    async onSubmit() {
      const getData = (name) => {
        const v = { list: classListField, search: classSearchField }
        return v[name].beforeSubmit(this[name], this.fieldProps)
      }
      if (this.interfaceUrl) {
        const data = {
          deptId: this.deptId,
          type: this.currentTabItem.value,
          path: this.interfaceUrl,
          pageHeaderConfigFormDTOList: getData(this.currentTab).filter(f => f.visible == '1'),
          ...this.interfaceParams
        }
        this.dialogParams.loading = true
        this.dialogParams.loading_submit = true
        let res = this.interfaceRequest.save ? await this.interfaceRequest.save(data) : await this.savePageHeaderConfig(data)
        this.dialogParams.loading = false
        this.dialogParams.loading_submit = false
        if (res.code == 1000) {
          if (this.currentTab == 'list') {
            this.dispatch.update(getData('list'), this.defaultSearch)
          } else {
            this.dispatch.update(this.defaultList, getData('search'))
          }
          this.$wTips.success(this.currentTabItem.title + '保存成功！')
          this.visible = false
        } else {
          this.$wTips.error(res.message)
        }
      } else {
        this.dispatch.update(getData('list'), getData('search'))
        this.dialogParams.loading = false
        this.dialogParams.loading_submit = false
      }
    },
  }
}