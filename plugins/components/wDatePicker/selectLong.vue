<template>
  <el-dialog
    custom-class="wDatePicker_weekDialog"
    :title="title"
    :visible.sync="isOpen"
    width="auto"
    @open="onOpen"
    @closed="onReset"
  >
    <w-alert v-if="tips" class="mb20" type="primary" icon="el-icon-warning" :title="tips" />
    <div class="wDatePicker">
      <div class="calendar" v-for="(item,index) in dateList" :key="index">
        <el-calendar :value="item.date">
          <template slot="dateCell" slot-scope="{date, data}">
            <p
              :class="['date-'+data.day, 'dateCell']"
              @click="onSelectDate($event,data,date)"
            >{{ date.getDate() }}</p>
          </template>
        </el-calendar>
      </div>
    </div>
    <span slot="footer">
      <w-button limit="default" @click="isOpen = false">取消</w-button>
      <w-button limit="default" type="primary" :disabled="diabledBtn" @click="onSave">确定</w-button>
    </span>
  </el-dialog>
</template>

<script>
import { getDiffDate, getDiffMonth, getLastDay } from '../../utils/yearDate'
import wAlert from '../wAlert.vue'
export default {
  components: {
    wAlert
  },
  props: {
    value: Array,
    title: String,
    range: Array,
    visible: Boolean,
    tips: String
  },
  data() {
    return {
      dateList: [],
      selectDate: [],
      diabledBtn: true,
      isInit: 0
    }
  },
  computed: {
    isOpen: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  watch: {
    selectDate: {
      handler(value) {
        this.onDiffDate(value)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /* 监听打开弹窗 */
    onOpen() {
      this.isInit = 0
      this.range.length && this.onInitData(this.range)
      if (this.value && this.value.length) {
        this.selectDate = JSON.parse(JSON.stringify(this.value))
      }
    },
    /* 渲染所有月份 */
    onInitData(value) {
      let [sTime, eTime] = value
      this.dateList = []
      /* 获取两个日期之间所有月份 */
      const diffMonth = getDiffMonth(sTime, eTime)
      diffMonth.forEach(e => {
        const date = `${e}-${'01'}`
        this.dateList.push({ dateString: date, date: new Date(date).getTime() })
      });
      /* 设置禁用日期 */
      let sTimeArr = sTime.split('-')
      const firstDate = sTimeArr[0] + '-' + sTimeArr[1] + '-' + '01'
      const lastDate = getLastDay(eTime)
      const disabledDate = [...getDiffDate(firstDate, sTime), ...getDiffDate(eTime, lastDate)]
      disabledDate.forEach(e => {
        if (e != sTime && e != eTime) {
          this.$nextTick(() => {
            document.querySelector('.current .date-' + e).classList.add('disabled')
          })
        }
      });
    },
    /* 使两个日期相连 */
    onDiffDate(value) {
      this.diabledBtn = value.length < 2
      if (value.length >= 2) {
        let [start, end] = value
        let diffDate = []
        let startTime = new Date(start).getTime()
        let endTime = new Date(end).getTime()
        diffDate = startTime < endTime ? getDiffDate(start, end) : getDiffDate(end, start)
        for (let i = 0; i < diffDate.length; i++) {
          this.$nextTick(() => {
            const e = diffDate[i];
            const isSelect = i == 0 || i == diffDate.length - 1
            const eles = document.querySelector('.current .date-' + e)
            if (this.isInit < 2 && isSelect) {
              eles.classList.add('in_range', 'select')
              this.isInit += 1
            } else {
              eles.classList.add('in_range')
            }
            eles.id = 'selected'
          })
        }
      }
    },
    /* 重置 */
    onReset() {
      const eles = document.querySelectorAll('.wDatePicker #selected')
      eles.forEach(f => {
        f.classList.remove('in_range', 'select')
      });
      this.selectDate = []
    },
    /* 选择某个日期 */
    onSelectDate(e, data) {
      this.selectDate.length >= 2 && this.onReset()
      if (!this.selectDate[0] || this.selectDate[0] != this.selectDate[1]) {
        e.target.classList.add('select')
        e.target.id = 'selected'
        this.selectDate.push(data.day)
      }
    },
    /* 点击保存 */
    onSave() {
      const s = new Date(this.selectDate[0])
      const e = new Date(this.selectDate[1])
      let value = [this.selectDate[0], this.selectDate[1]]
      if (s > e) {
        value = [this.selectDate[1], this.selectDate[0]]
      }
      this.$emit('update:value', value)
      this.$emit('change', value)
      this.isOpen = false
    }
  }
}
</script>