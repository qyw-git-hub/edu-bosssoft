import Vue from 'vue'
import { toFixed } from '../utils/common.js'
import input from './dirPrice'

//适用包含el-dialog相关弹窗，打开时滚动到顶部
Vue.directive('dialog-scroll-to-top', {
  bind(el, binding, vnode, oldVnode) {
    console.log(binding, oldVnode);
    const dialog = vnode.componentInstance;
    if (dialog) {
      dialog.$watch('visible', show => {
        if (show) {
          Vue.nextTick(() => {
            const dialog__body = el.querySelector('.el-dialog__body');
            if (dialog__body) {
              dialog__body.scrollTop = 0;
            }
          });
        }
      });
    }
  }
});

// v-dialogDrag: 弹窗拖拽
Vue.directive('dialogDrag', {
  bind(el) {
    const dialogHeaderEl = el.querySelector('.el-dialog__header')
    const dragDom = el.querySelector('.el-dialog')
    dialogHeaderEl.style.cursor = 'move'
    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const sty = dragDom.currentStyle || window.getComputedStyle(dragDom, null)
    dialogHeaderEl.onmousedown = (e) => {
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop
      // 获取到的值带px 正则匹配替换
      let styL, styT
      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (sty.left.includes('%')) {
        styL = +document.body.clientWidth * (+sty.left.replace(/%/g, '') / 100)
        styT = +document.body.clientHeight * (+sty.top.replace(/%/g, '') / 100)
      } else {
        styL = +sty.left.replace(/\px/g, '')
        styT = +sty.top.replace(/\px/g, '')
      }
      document.onmousemove = function (e) {
        // 通过事件委托，计算移动的距离
        const l = e.clientX - disX
        const t = e.clientY - disY
        // 移动当前元素
        dragDom.style.left = `${l + styL}px`
        dragDom.style.top = `${t + styT}px`
        // 将此时的位置传出去
        // binding.value({x:e.pageX,y:e.pageY})
      }
      document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null
      }
    }
  }
})

// v-enterNumber: 限制输入框只能输入整数
Vue.directive('enterNumber', {
  inserted: function (el) {
    el.addEventListener('keypress', function (e) {
      e = e || window.event
      const charcode = typeof e.charCode === 'number' ? e.charCode : e.keyCode
      const re = /^(?!0)\d+$/;
      if (!re.test(String.fromCharCode(charcode)) && charcode > 9 && !e.ctrlKey) {
        if (e.preventDefault) {
          e.preventDefault()
        } else {
          e.returnValue = false
        }
      }
    })
  }
})

// v-toFixed: 实现只能输入数字，或输入2位或4位小数（通过传参控制）
Vue.directive('toFixed', {
  componentUpdated(el, binding) {
    const toFixedLength = binding.value
    if (!toFixedLength) {
      return false
    }
    const ele = el.tagName === 'INPUT' ? el : el.querySelector('input')
    ele.addEventListener('input', () => {
      let val = ele.value
      if (isNaN(val)) {
        ele.value = ''
        return false
      }
      if (typeof val === 'number') {
        val = val.toString()
      }
      if (typeof val === 'string') {
        switch (toFixedLength) {
          case 2:
            val = val.replace(/^(-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
            break
          case 3:
            val = val.replace(/^(-)*(\d+)\.(\d\d\d).*$/, '$1$2.$3')
            break
          case 4:
            val = val.replace(/^(-)*(\d+)\.(\d\d\d\d).*$/, '$1$2.$3')
            break
          case 6:
            val = val.replace(/^(-)*(\d+)\.(\d\d\d\d\d\d).*$/, '$1$2.$3')
            break
        }
        ele.value = val
      }
    })
  }
})


Vue.directive('blur', {
  bind(el, binding) {
    if (!el) {
      return
    }
    if (el.tagName.toLowerCase() !== 'input') {
      el = el.getElementsByTagName('input')[0]
    }
    if (el.type == 'number') {
      el.classList.add('clearInputNumber_self')
      el.addEventListener('mousewheel', (e) => { /* 阻止滚动修改金额 */
        e = e || window.event;
        e.preventDefault()
      })
      el.addEventListener('DOMMouseScroll', (e) => { /* 阻止滚动修改金额 */
        e = e || window.event;
        e.preventDefault()
      })
    }
    switch (binding.arg) {
      case 'price': /* 金额 */
        el.setAttribute('autocomplete', 'off')
        el.setAttribute('title', '')
        el.addEventListener('blur', () => {
          const isFun = typeof binding.value == 'function'
          if (isFun && el.value) {
            let value = parseFloat(el.value)
            let min = parseFloat(el.min)
            let max = parseFloat(el.max)
            value = value < min ? min : value > max ? max : value
            if (binding.modifiers.four) {
              el.value = value.toFixed(4)
            } else {
              el.value = toFixed(value)
            }
            binding.value(el.value)
          }
        })
        break;
      case 'integer': /* 整数 */
        el.setAttribute('autocomplete', 'off')
        el.setAttribute('title', '')
        el.addEventListener('blur', () => {
          const isFun = typeof binding.value == 'function'
          if (isFun && el.value) {
            let value = el.value
            let min = el.min ? Number(el.min) : ''
            let max = el.max ? Number(el.max) : ''
            value = parseInt(value.replace(/^(\d+)(\.\d+)?$/, '$1').replace(/^0+(\d)/g, '$1'))
            if (typeof value == 'number') {
              if (typeof min == 'number' && value < min) {
                el.value = min
              } else if (typeof max == 'number' && value > max) {
                el.value = max
              } else {
                el.value = value
              }
            } else {
              el.value = value
            }
            binding.value(el.value)
          }
        })
        break;
    }
  }
})

Vue.directive('input', input)

/**
 * 文字溢出省略指令
 * v-ellipsis || Number || null
 * 无参数默认一行省略，Number参数表示至多几行省略。（建议设置width或max-width）
 * ex：<span v-ellipsis class="setwidth">{{ content }}</span>
 * ex：<div v-ellipsis="2" class="setwidth">{{ content }}</div>
 * ex：<div v-ellipsis:2 class="setwidth">{{ content }}</div>
 */
function setLine(binding, prop) {
  if (binding[prop]) {
    if (isNaN(Number(binding[prop])) || Number(binding[prop]) < 1) {
      throw 'v-ellipsis参数错误，请传入大于等于1的数字';
    } else {
      return Number(binding[prop]);
    }
  }
}

/* 显示省略号 */
Vue.directive('ellipsis', {
  inserted: (el, binding) => {
    let line = 1;
    if (binding.value) {
      line = setLine(binding, 'value');
    }
    if (binding.arg) {
      line = setLine(binding, 'arg');
    }
    if (line == 1) {
      el.classList.add('text_overflow1');
    } else {
      el.classList.add('ellipsis_base');
      el.style['-webkit-line-clamp'] = line;
    }
  }
});

// 获取一屏的高度
Vue.directive('resizeScroll', {
  bind(el, binding) {
    el.resize = () => { binding.value() }
    window.addEventListener('resize', el.resize)
  },
  unbind(el) {
    window.removeEventListener('resize', el.resize)
  }
})