/**
 * @description: 提示窗
*/

class WTips {
  constructor(Message, MessageBox) {
    this.message = Message;
    this.messageBox = MessageBox;
  }
  error(message, title = '错误提示', options = {}) {
    this.messageBox.alert(message, title, {
      confirmButtonText: '确定',
      type: 'error',
      callback: action => {
        options.callback && options.callback();
      },
      ...options
    });
  }
  warning(message, title = '提示', options = {}) {
    this.messageBox.alert(message, title, {
      confirmButtonText: '确定',
      type: 'warning',
      callback: action => {
        options.callback && options.callback();
      },
      ...options
    });
  }
  success(message) {
    this.message.success(message);
  }
  confirm(message, title = '提示', options = {}) {
    return this.messageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      ...options
    })
  }
}
export default WTips