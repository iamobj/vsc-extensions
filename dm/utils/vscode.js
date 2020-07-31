const vscode = require('vscode')

module.exports = {
  /**
   * 创建一个输入框
   * @params {Function} verify 校验
   * @params {Boolean} ignoreFocusOut 输入框失去焦点,是否也保持打开状态，默认true(保持)
   */
  showInput({verify = null, placeholder = '', ignoreFocusOut = true, defaultValue = ''}) {
    return new Promise((resolve,reject) => {
      const input = vscode.window.createInputBox()
      input.ignoreFocusOut = ignoreFocusOut
      input.placeholder = placeholder
      input.value = defaultValue
      // 输入完按下回车键触发
      input.onDidAccept(() => {
        let value = input.value
        if (value === '') {
          return
        }
        // 有没有校验
        if (verify instanceof Function) {
          verify(value).then(() => {
            resolve(value)
            input.dispose()
          }).catch(error => {
            // 校验没通过
            input.validationMessage = error
          })
        } else {
          resolve(value)
          input.dispose()
        }
      })

      input.show()
    })
  }
}