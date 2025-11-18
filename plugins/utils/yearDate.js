
/**
 * 根据传入的时间，获取日期/时间
 */
export function getDateInfo(dateStr) {
  if (!dateStr) return
  const time = new Date(dateStr)
  const year = time.getFullYear() // 年
  const month = time.getMonth() + 1 // 月
  const day = time.getDate() // 日
  const hour = time.getHours() // 时
  const minute = time.getMinutes() // 分
  const seconds = time.getSeconds() // 秒
  const days = time.getDay() // 一周的第几天，从0开始
  const weekMap = { // 日期map
    0: '星期天',
    1: '星期一',
    2: '星期二',
    3: '星期三',
    4: '星期四',
    5: '星期五',
    6: '星期六',
  }
  // 周几
  const week = weekMap[days]
  return {
    year,
    month: month < 10 ? `0${month}` : month,
    monthSimple: month,
    day: day < 10 ? `0${day}` : day,
    daySimple: day,
    hour: hour < 10 ? `0${hour}` : hour,
    hourSimple: hour,
    minute: minute < 10 ? `0${minute}` : minute,
    minuteSimple: minute,
    seconds: seconds < 10 ? `0${seconds}` : seconds,
    secondsSimple: seconds,
    days,
    week
  }
}

/**
 * 获取日期、星期、星期几、当前日期所在周的数组方法
 * @param {*} date - 日期字符串（日期）
 * @param {*} startWeekDay - 从哪天开始，默认为周一开始，如果为周天开始传0
 * @returns { date: String, week: String, days: Number } - 返回日期字符串-星期几-一周的第几天
 */
export function getDates(date, startWeekDay = 1) {
  if (!date) return
  const time = new Date(date)
  const year = time.getFullYear() // 年
  const month = time.getMonth() + 1 // 月
  const day = time.getDate() // 日
  const days = time.getDay() // 一周的第几天
  const weekMap = { // 日期map
    0: '星期天',
    1: '星期一',
    2: '星期二',
    3: '星期三',
    4: '星期四',
    5: '星期五',
    6: '星期六',
  }
  // 周几
  const week = weekMap[days]
  // 获得当前日期所在周的信息
  const weekArr = dealWeekArr(time, days, startWeekDay)
  return {
    day: dealNumber(day), // 日期（天、号）
    date: `${year}-${dealNumber(month)}-${dealNumber(day)}`, // 日期
    month: month, // 月
    year: year, // 年
    week, // 星期几
    monthWeek: getMonthWeek(year, month, day),
    days, // 一周的第几天
    weekArr, // 所处当周的信息
  }
}

// 根据周几获取整个周的信息
function dealWeekArr(date, days, startWeekDay = 1) {
  let arr = []
  const nowTime = date.getTime() // 当前时间戳
  const oneDayTime = 24 * 60 * 60 * 1000 // 一天的时间
  // 获取前一周周一或者是当周周一
  const mondayTime = nowTime - (days === 0 ? days + 6 : days - startWeekDay) * oneDayTime
  for (let i = 0; i < 7; i++) {
    var tempDate = new Date(mondayTime)
    tempDate = tempDate.setDate(tempDate.getDate() + i)
    tempDate = new Date(tempDate)
    const title = getWeekDay(tempDate.getDay())
    arr.push({ title, day: dealNumber(tempDate.getDate()), fullDate: getFullDate(tempDate, '-') })
  }
  return arr
}
// 根据周几转换为中文一、二、三
export function getWeekDay(days) {
  const dayObj = {
    0: '日',
    1: '一',
    2: '二',
    3: '三',
    4: '四',
    5: '五',
    6: '六'
  }
  return dayObj[days]
}

// 将不足两位的数字补齐为2位
export function dealNumber(day) {
  if (day >= 0 && day < 10) {
    return '0' + day
  } return day
}

/* 获取完整日期 */
export function getFullDate(tempDate, split) {
  split = split || '-'
  return (tempDate.getFullYear()) + split + dealNumber(tempDate.getMonth() + 1) + split + (dealNumber(tempDate.getDate()))
}

/* 获取完整日期包括时分秒 */
export function getFullDateTime(tempDate, split) {
  const date = getFullDate(tempDate, split)
  const h = tempDate.getHours()
  const m = tempDate.getMinutes()
  const s = tempDate.getSeconds()
  return date + ' ' + dealNumber(h) + ':' + dealNumber(m) + ':' + dealNumber(s)
}

/* 获取当月的第一天日期 */
export function getFirstDay(date) {
  var year = new Date(date).getFullYear() // 获取年份
  var month = new Date(date).getMonth() + 1 // 获取月份
  var lastDate = new Date(year, month, 1).getDate()
  return year+'-'+dealNumber(month)+'-'+dealNumber(lastDate)
}

/* 获取当月的最后一天日期 */
export function getLastDay(date) {
  var year = new Date(date).getFullYear() // 获取年份
  var month = new Date(date).getMonth() + 1 // 获取月份
  var lastDate = new Date(year, month, 0).getDate() // 获取当月最后一日
  month = month < 10 ? '0' + month : month // 月份补 0
  return year+'-'+month+'-'+lastDate
}

/* 获取当月对应的周 */
function getMonthWeek(a, b, c) { // a为年 b为月 c为日
  const date = new Date(a, parseInt(b) - 1, c)
  let w = date.getDay()
  const d = date.getDate()
  if (w == 0) {
    w = 7
  }
  const week = Math.ceil((d + 6 - w) / 7)
  const text = ['一', '二', '三', '四', '五', '六']
  return { en: week, cn: text[week - 1] }
}

/* 获取两个日期之间的所有日期 */
export function getDiffDate(stime, etime) {
  let diffdate = new Array();
  let i = 0;
  while (stime <= etime) {
    diffdate[i] = stime;

    let stime_ts = new Date(stime).getTime();
    let next_date = stime_ts + (24 * 60 * 60 * 1000);
    let next_dates_y = new Date(next_date).getFullYear() + '-';
    let next_dates_m = (new Date(next_date).getMonth() + 1 < 10) ? '0' + (new Date(next_date).getMonth() + 1) + '-' : (new Date(next_date).getMonth() + 1) + '-';
    let next_dates_d = (new Date(next_date).getDate() < 10) ? '0' + new Date(next_date).getDate() : new Date(next_date).getDate();

    stime = next_dates_y + next_dates_m + next_dates_d;

    i++;
  }
  return diffdate;
}

/* 获取两个日期之间的所有月份 */
export function getDiffMonth(start, end) {
  let result = [];
  let s = start.split("-");
  let e = end.split("-");
  
  // 使用正确的月份索引（0 到 11）
  let min = new Date(s[0], s[1] - 1);
  let max = new Date(e[0], e[1] - 1);
  
  let curr = min;
  while (curr <= max) {
    let month = curr.getMonth() + 1; // 转换为 1 到 12
    let year = curr.getFullYear();
    let str = year + '-' + (month < 10 ? '0' + month : month);
    
    result.push(str);
    curr.setMonth(curr.getMonth() + 1);
  }
  return result;
}

/* 日期格式化 */
Date.prototype.format = function (fmt) {
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}

/* 获取指定月份的各周真实日期 */
export function allWeeks(now_month) {
  let date = new Date()
  let today = 1
  const firtDay = new Date(now_month + '-' + dealNumber(today))
  let year = firtDay.getFullYear();
  let month = firtDay.getMonth();
  switch (firtDay.getDay()) {
    case 2: today = today + 6; break;
    case 3: today = today + 5; break;
    case 4: today = today + 4; break;
    case 5: today = today + 3; break;
    case 6: today = today + 2; break;
    case 0: today = today + 1; break;
  }
  let week_array = [];
  let end = now_month != date.format("yyyy-MM") ? new Date(year, month + 1, 0) : new Date(year, month, date.format("dd"))// 得到当月最后一天

  while (new Date(year, month, today) <= end) {
    const weeks = [new Date(year, month, today).format("yyyy-MM-dd"), new Date(year, month, today + 6).format("yyyy-MM-dd")]
    week_array.push({
      year,
      month: month + 1,
      weeks,
      weeksStr: weeks.join(','),
      checked: false
    })
    today += 7;
  }

  return week_array;
}

export const daterangePickerOptions = {
  shortcuts: [{
    text: '最近一周',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      picker.$emit('pick', [start, end]);
    }
  }, {
    text: '最近一个月',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      picker.$emit('pick', [start, end]);
    }
  }, {
    text: '最近三个月',
    onClick(picker) {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      picker.$emit('pick', [start, end]);
    }
  }]
}

// 获取传入日期周列表信息，有下面三种传参情况,
/*
  1、不传入参数，func（），则获取传入日期所在周的信息
  2、传如日期，func('2024-12-14'，'lastWeek'),则获取传入日期上一周的信息
  3、传如日期，func('2024-12-14'，'nextWeek'),则获取传入日期下一周的信息
  都要考虑传入日期所在周跨月、跨年的情况，返回格式统一如下：
  [
    { day: '2024-12-16', monthDay: '12-16', week: '周一' },
    { day: '2024-12-17', monthDay: '12-17', week: '周二' },
    // ...
  ];
*/
export function getWeekInfoByDate(dateInput = new Date(), weekType = '') {
  // 判断传入参数类型
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  // 将日期字符串转换为日期对象
  const parseDate = date => (typeof date === 'string' ? new Date(date) : date);

  // 获取当前日期对应周的起始日期
  const getWeekStartDate = date => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // 计算本周一的日期
    date.setDate(diff);
    date.setHours(0, 0, 0, 0); // 清除时分秒
    return date;
  };

  // 获取上一周或下一周的日期
  const getAdjustedDate = (date, type) => {
    const adjustedDate = new Date(date);
    if (type === 'lastWeek') {
      adjustedDate.setDate(date.getDate() - 7);
    } else if (type === 'nextWeek') {
      adjustedDate.setDate(date.getDate() + 7);
    }
    return adjustedDate;
  };

  // 格式化日期输出
  const formatDate = date => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return {
      day: `${year}-${month}-${day}`,
      monthDay: `${month}-${day}`,
      week: weekDays[date.getDay()]
    };
  };

  // 处理传入日期
  let currentDate = parseDate(dateInput);

  // 根据参数调整日期
  if (weekType === 'lastWeek' || weekType === 'nextWeek') {
    currentDate = getAdjustedDate(currentDate, weekType);
  }

  // 获取本周的起始日期
  const weekStartDate = getWeekStartDate(currentDate);

  // 计算当前周的七天
  const weekInfo = [];
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(weekStartDate);
    weekDate.setDate(weekStartDate.getDate() + i);
    weekInfo.push(formatDate(weekDate));
  }

  return weekInfo;
}