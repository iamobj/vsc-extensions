const path = require("path")

const utils = {
  /**
   * 获取某个扩展文件绝对路径
   * @param context 上下文
   * @param relativePath 扩展中某个文件相对于根目录的路径，如 src/createPackage/templates/.dm/runtime.config.json
   */
  getExtensionFileAbsolutePath(context, relativePath) {
    return path.join(context.extensionPath, relativePath)
  }
}

module.exports = utils