import { toFixed } from '../utils/common.js'
const addListener = function (el, type, fn) {
  el.addEventListener(type, fn, false)
}

//去掉空格
const spaceFilter = function (el) {
  addListener(el, 'input', () => {
    el.value = el.value.replace(/\s+/, '')
  })
}
// 防抖
let debounce = (fn, delay) => {
  delay = delay || 100;
  var timer;
  return function () {
    var th = this;
    var args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      timer = null;
      fn.apply(th, args);
    }, delay);
  };
}
// 限制只能输入整数和小数（价格类、最多两位小数）
const priceFilter = function (el, binding) {
  addListener(el, 'input', debounce(() => {//添加防抖 防止反复触发事件导致内存溢出
    el.value = (el.value.match(/^\d*(\.?\d{0,2})/g)[0]) || null
    if (isNaN(el.value)) {
      el.value = ''
    }
    //触发input事件
    el.dispatchEvent(new Event('input'))
  }))
  addListener(el, 'blur', () => {
    el.value = toFixed(el.value)
    binding.value && binding.value(el.value)
  })
}

export default {
  bind(el, binding) {
    if (el.tagName.toLowerCase() !== 'input') {
      el = el.getElementsByTagName('input')[0]
    }
    spaceFilter(el)
    switch (binding.arg) {
      case 'price':
        priceFilter(el, binding)
        break
      default:
        console.warn('未知指令类型', binding.arg)
        break
    }
  }
}