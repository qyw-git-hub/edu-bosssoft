wx.config({
  debug: false, // 开启调试模式，调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
  appId: 'yourAppId', // 必填，公众号的唯一标识
  timestamp: '', // 必填，生成签名的时间戳
  nonceStr: '', // 必填，生成签名的随机串
  signature: '', // 必填，签名
  jsApiList: [
    'updateAppMessageShareData',
    'updateTimelineShareData',
    'onMenuShareAppMessage',
    'onMenuShareTimeline'
  ] // 必填，需要使用的JS接口列表
});

wx.ready(function() {
  // 分享给朋友
  wx.updateAppMessageShareData({
    title: 'title', // 分享标题
    desc: 'describ', // 分享描述
    link: 'link', // 分享链接，必须与当前页面对应的公众号 JS 接口安全域名一致
  
    imgUrl: 'imgurl', // 分享图标
    success: function(res) {
      // 分享成功后的回调函数
    },
    cancel: function() {
      // 用户取消分享后执行的回调函数
    }
  });
});