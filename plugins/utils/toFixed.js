// 处理toFixed方法精度问题
Number.prototype.nFixed = Number.prototype.toFixed
window.Number.prototype.toFixed = function (n) {
  if (n > 20 || n < 0) {
    throw new RangeError('toFixed() digits argument must be between 0 and 20')
  }
  var number = this

  // 非数字或数字过大，直接返回
  if (isNaN(number) || number >= Math.pow(10, 21)) {
    return number.toString()
  }
  // 截取位数为falsey，取整
  if (!Number(n)) {
    return (Math.round(number)).toString()
  }

  var result = number.toString()
  var arr = result.split('.')

  // 整数的情况
  if (arr.length < 2) {
    result += '.'
    for (var i = 0; i < n; i += 1) {
      result += '0'
    }
    return result
  }

  var integer = arr[0]
  var decimal = arr[1]
  // 正好等于位数
  if (decimal.length === n) {
    return result
  }
  // 不够截取长度
  if (decimal.length < n) {
    for (var i = 0; i < n - decimal.length; i += 1) {
      result += '0'
    }
    return result
  }
  // 按位数截取
  result = integer + '.' + decimal.substr(0, n)

  // 四舍五入，避免浮点数精度的损失
  var last = decimal.substr(n, 1) // 保留位数的后一位数字
  if (parseInt(last, 10) >= 5) { // last大于等于5的，由于四舍五入，需要将结果最后一位加上1(正数+1,负数-1)
    var midNum = Math.pow(10, n)
    var sign = number / Math.abs(number) // 判断数字的符号
    result = (Math.round((parseFloat(result) * midNum)) + sign) / midNum // 324.09*100 = 32408.999999999996，因此使用Math.round() 将结果四舍五入为32409
    result = result.nFixed(n) // 再次调用原生toFixed方法，是为了防止上次的 result 结果为整数
  }
  return result
}
