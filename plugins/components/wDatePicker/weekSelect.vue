<template>
  <div>
    <el-popover
      class="wDatePicker_weekSelect"
      v-model="visible"
      placement="bottom-start"
      width="390"
      trigger="manual"
      @show="onShowPop"
      @hide="onHidePop"
    >
      <div class="wDatePicker_weekSelect_pop">
        <div class="title">
          <i class="el-icon-d-arrow-left pointer" @click="onChangeYear('pref')"></i>
          <p class="yearText">{{currentYear}}年</p>
          <i class="el-icon-d-arrow-right pointer" @click="onChangeYear('next')"></i>
        </div>
        <ul class="weeks">
          <li v-for="(item,index) in dateList" :key="index">
            <span class="monthText">{{item.month}}月</span>
            <p
              :class="week.checked&&'active'"
              v-for="(week,j) in item.weeks"
              :key="j"
              @click="onSelectWeekOption(week, j)"
            >
              <span>第{{getWeekDay(j+1)}}周</span>
            </p>
          </li>
        </ul>
        <div class="footer">
          <w-button type="default" @click="onClear">清除</w-button>
          <w-button type="primary" @click="onSave">确定</w-button>
        </div>
      </div>
      <el-select
        popper-class="wDatePicker_select"
        slot="reference"
        v-model="currentWeeks"
        :style="{ width: selectAttrs.width }"
        v-bind="selectAttrs"
        @click.native="isShowPop"
        @clear="onClear"
        @remove-tag="onRemoveTag"
      >
        <i class="el-icon-date" slot="prefix" />
        <el-option
          v-for="item in selectOption"
          :key="item.weeksStr"
          :label="`${item.month}月${item.weeksNum}`"
          :value="item.weeksStr"
        ></el-option>
      </el-select>
    </el-popover>
  </div>
</template>

<script>
import { allWeeks, dealNumber, getWeekDay } from '../../utils/yearDate'
export default {
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: Array,
      default: () => []
    },
    selectParams: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      visible: false,
      getWeekDay,
      currentWeeks: [],
      dateList: [],
      selectOption: [],
      currentYear: new Date().getFullYear()
    }
  },
  computed: {
    selectAttrs() {
      return {
        multiple: true,
        'collapse-tags': true,
        placeholder: '请选择',
        readonly: true,
        'popper-append-to-body': false,
        ...this.selectParams
      }
    }
  },
  watch: {
    value: {
      handler() {
        this.setValue()
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    setValue() {
      this.isCancel = false
      this.selectOption = []
      this.currentWeeks = JSON.parse(JSON.stringify(this.value || []))
      this.onInitWeeks()
    },
    /* 打开弹窗 */
    onShowPop() {
      const maskEl = document.createElement('div')
      maskEl.classList.add('mask', 'weekSelectMask')
      maskEl.addEventListener('click', () => {
        this.visible = !this.visible
      })
      document.body.appendChild(maskEl)
      this.setValue()
    },
    /* 关闭弹窗 */
    onHidePop() {
      if (!this.isCancel) {
        this.currentWeeks = JSON.parse(JSON.stringify(this.value))
        this.onChange()
      }
      document.querySelector('.weekSelectMask').remove()
    },
    /* 初始化周 */
    onInitWeeks() {
      const date = new Date()
      const month = this.currentYear == date.getFullYear() ? date.getMonth() + 1 : 12
      this.dateList = []
      for (let i = 1; i <= month; i++) {
        const weeks = allWeeks(this.currentYear + '-' + dealNumber(i))
        if (weeks && weeks.length) {
          this.dateList.push({ month: i, weeks })
        }
      }
      this.getSelectWeek()
    },
    /* 选择当前周 */
    onSelectWeekOption(item, i) {
      if (!item.checked) {
        this.selectOption.push({ ...item, weeksNum: `第${getWeekDay(i + 1)}周` })
      } else {
        this.selectOption = this.selectOption.filter(f => f.weeksStr != item.weeksStr)
      }
      item.checked = !item.checked
      this.currentWeeks = this.selectOption.map(m => m.weeksStr)
    },
    /* 获取当前已选周 */
    getSelectWeek() {
      this.dateList.forEach(e => {
        e.weeks.forEach((f, i) => {
          if (this.currentWeeks.includes(f.weeksStr)) {
            f.checked = true
            if (!this.selectOption.find(s => s.weeksStr == f.weeksStr)) {
              this.selectOption.push({ ...f, weeksNum: `第${getWeekDay(i + 1)}周` })
            }
          }
        });
      });
    },
    /* 点击是否显示 */
    isShowPop() {
      this.visible = !this.visible
    },
    /* 切换月份 */
    onChangeYear(type) {
      const date = new Date()
      switch (type) {
        case 'pref':
          this.currentYear -= 1
          break;
        case 'next':
          this.currentYear += 1
          if (this.currentYear >= date.getFullYear()) {
            this.currentYear = date.getFullYear()
          }
          break;
      }
      this.onInitWeeks()
    },
    /* 点击清除某一项 */
    onRemoveTag(value) {
      this.dateList.forEach(e => {
        const item = e.weeks.find(f => f.weeksStr == value)
        if (item) {
          item.checked = false
          this.selectOption = this.selectOption.filter(f => f.weeksStr != item.weeksStr)
        }
      });
      this.currentWeeks = this.selectOption.map(m => m.weeksStr)
      !this.visible && this.onChange()
    },
    /* 点击确定 */
    onSave() {
      this.isCancel = true
      this.visible = false
      this.onChange()
    },
    /* 点击清除 */
    onClear() {
      this.visible = false
      this.currentWeeks = []
      this.onChange()
    },
    /* 传递数据 */
    onChange() {
      this.$emit('change', this.currentWeeks, {
        checkedKeys: this.currentWeeks,
        checkedNodes: this.selectOption
      })
    }
  }
}
</script>
