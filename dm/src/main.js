const vscode = require('vscode')

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  // console.log('dm插件被激活')

  require('./createPackage')(context)
}

function deactivate() {
  // this method is called when your extension is deactivated
}

module.exports = {
  activate,
  deactivate
}
