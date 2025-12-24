import { Message } from 'element-ui';
/**
 * @param {*} obj 
 * @returns 
 */
export function isObjectNotEmpty(obj) {
  return obj !== null && obj !== undefined && Object.keys(obj).length > 0;
}

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * 生成随机数
 */
export function randomString(len) {
  len = len || 32;
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  var maxPos = $chars.length;
  var pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

/**
 * 深拷贝
 * @param  obj
 * @returns  { obj }
 */
export function deepClone(obj) {
  if (obj === null) return null;
  if (obj instanceof RegExp) return new RegExp(obj);
  if (obj instanceof Date) return new Date(obj);
  if (typeof obj !== 'object') return obj; // 如果不是复杂数据类型，直接返回
  let newObj = new obj.constructor(); //生成对象实例（Array、Object....）
  for (let key in obj) {
    newObj[key] = deepClone(obj[key]);
  }
  return newObj;
}

/**
 * 提取文件类型
 * @param  fileUrl 文件地址
 * @returns {Object} 文件类型 { suffix: 'png', isImg: true, isFile: false }
 */
export function extractFileType(fileUrl) {
  // 地址： http://pic.bosssoftcq.com.cn/img (4)202725.png?e=17246&token=kcE666fY=
  const pattern = /\.([0-9a-zA-Z]+)\?/;
  const match = fileUrl.match(pattern);
  const imgTypes = [
    'png',
    'jpg',
    'jpeg',
    'gif',
    'bmp',
    'webp',
    'tiff',
    'ico',
    'tif',
    'jfif',
    'jp2',
    'jpx',
    'wdp',
    'webp',
    'heic',
    'avif'
  ];
  const suffix = match ? match[1].toLowerCase() : null;
  const isImg = suffix ? imgTypes.includes(suffix) : null;
  const isFile = suffix ? !isImg : null;
  return { suffix, isImg, isFile };
}

/**
 * 防抖
 * @param call
 * @param ms
 * @param unique
 * @return {function(...[*]=): void}
 */
export function debounce(fn, delay) {
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

/* 四舍五入-保留2位小数 */
export function toFixed(num) {
  if(!num) num = ''
  num = num.toString().replace(/\$,/g, '')
  if (isNaN(num)) {
    num = '0'
  }
  const sign = (num == (num = Math.abs(num)))// 数字是否为正负数  Math.abs() 返回参数的绝对值
  num = Math.floor(num * 100 + 0.50000000001)// 返回小于等于num*100+0.50000000001的最大整数:
  let cents = num % 100 // 小数位数
  num = Math.floor(num / 100).toString()// 整数位数
  if (cents < 10) {
    cents = '0' + cents// 小数位补0
  }
  return (((sign) ? '' : '-') + num + '.' + cents)
}

// 获取用户信息
export function getUser() {
  if (localStorage.getItem('user')) {
    return JSON.parse(localStorage.getItem('user'));
  }
  return null;
}

/**
 * 数值转换千分位，默认保留两位小数
 * @param {num} num - 传入值
 * @param {accuracy} accuracy - 保留小数精度[默认两位]
 * @param {isOmitEnd} isOmitEnd - 是否去掉末尾的0
 * @returns nnn,nnn.nn
 */
export function toThousands(num = 0, accuracy = 2, isOmitEnd = false) {
  const numStr = Number(num).toFixed(accuracy);
  let [intPart, decPart] = numStr.split('.');
  if (accuracy >= 2 && isOmitEnd) {
    decPart = decPart.slice(0, 2) + decPart.slice(2).replace(/0+$/, '');
  }
  return intPart.replace(/\d{1,3}(?=(\d{3})+$)/g, '$&,') + '.' + decPart;
}

/* 金额还原 */
export function restoreSummaryFormatting(value) {
  if (!value) {
    return 0.00;
  }
  let str = String(value).replace(/,/g, '')
  let multiple = 1;

  // 处理“万”单位
  if (str.includes('万')) {
    multiple = 10000;
    str = str.replace('万', '');
  }

  const numberMatch = str.match(/(-?\d+\.?\d*)/);
  if (numberMatch) {
    str = numberMatch[0];
  } else {
    // 如果没有找到数字，返回0
    return 0.00;
  }

  const num = Number(str) * multiple;
  return isNaN(num) ? 0.00 : num.toFixed(2)
}

/**
 * 复制普通文本
 * @param {String|Number} text - 要复制的文字
 * @param {String} successMsg - 成功提示的文字
 * @param {Boolean} showTips - 是否显示成功的提示
 */
export function copyText(text, successMsg = '复制成功', showTips = true) {
  const oInput = document.createElement('input');
  oInput.value = text;
  document.body.appendChild(oInput);
  oInput.select(); // 选择对象;
  document.execCommand('Copy'); // 执行浏览器复制命令
  document.body.removeChild(oInput);
  showTips && Message.success(successMsg);
}