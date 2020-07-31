// front目录新建包/子应用
const vscode = require('vscode')
const { getExtensionFileAbsolutePath, showInput } = require('../../utils')
const fs = require('fs')
const config = require('./config')

function checkDirectoryName(subDirectorys, value) {
  return new Promise((resolve,reject) => {
    if (subDirectorys.includes(value)) {
      reject('目录名称重复，请重新输入')
    } else {
      resolve()
    }
  })
}

function handleCopy({src, target, baseName = '', pkgName = '', description = ''}) {
  try {
    fs.accessSync(target)
  } catch (error) {
    // 没有改目录，就创建目录
    fs.mkdirSync(target)
  }
  try {
    const paths = fs.readdirSync(src)
    paths.forEach(path => {
      const _src = `${src}/${path}`
      const _target = `${target}/${path}`
      const stat = fs.lstatSync(_src)
      if (stat.isFile()) {
      // 是文件
        switch (path) {
          case 'package.json':
            const content = handlePackageJson({
              content: fs.readFileSync(_src, 'utf-8'),
              baseName,
              pkgName,
              description
            })
            fs.writeFileSync(_target, content)
            break
          case 'build.js':
          case 'deploy.js':
          case 'watch.js':
            fs.writeFileSync(_target, fs.readFileSync(_src, 'utf-8').replace(config.baseNameReg, baseName))
            break
          case 'runtime.config.json':
            fs.writeFileSync(_target, fs.readFileSync(_src, 'utf-8').replace(config.pkgNameReg, pkgName).replace(config.baseNameReg, baseName))
            break
          default:
            fs.writeFileSync(_target, fs.readFileSync(_src, 'utf-8'))
            break
        }
      } else if (stat.isDirectory()) {
      // 是目录 就递归
        const params = {
          ...arguments[0],
          src: _src,
          target: _target
        }
        handleCopy(params)
      }
    })
  }catch (error) {
    console.error(error)
  }
}

// 处理package.json文件
function handlePackageJson({ content = '', baseName = '', pkgName = '', description = ''}) {
  let result = content
  result = result.replace(config.baseNameReg, baseName)
  result = result.replace(config.descriptionReg, description)
  result = result.replace(config.pkgNameReg, pkgName)
  return result
}


module.exports = context => {
  const disposable = vscode.commands.registerCommand('extension.dm.createPackage', async e => {
    const selectPath = e.fsPath // 选择的目录路径
    // 判断当前选择的目录是不是front目录
    const currentDirectory = selectPath.substring(selectPath.lastIndexOf('\/') + 1, selectPath.length)
    if (currentDirectory !== 'front') {
      vscode.window.showErrorMessage('请选择front目录')
      return
    }

    const type = await vscode.window.showQuickPick(Object.keys(config.typeOps), {placeHolder: '第一步：请选择新建类型', ignoreFocusOut: true})
    if (type === undefined) return

    // 选择的目录下的子目录名数组
    const subDirectorys = fs.readdirSync(selectPath).filter(item => {
      const stat = fs.lstatSync(`${selectPath}/${item}`)
      return stat.isDirectory()
    })

    const directoryName = await showInput({
      placeholder: '第二步：输入目录名称',
      verify: value => checkDirectoryName(subDirectorys, value)
    })

    const description = await showInput({
      placeholder: '最后一步：输入包的描述信息',
      defaultValue: '点米内部系统-前端层/'
    })

    // 拿packjson里的name属性前缀
    let baseName = ''
    subDirectorys.some(item => {
      const fielPath = `${selectPath}/${item}/package.json`
      if (fs.existsSync(fielPath)) {
        const content = JSON.parse(fs.readFileSync(fielPath, 'utf-8'))
        baseName = content.name.split('-front')[0]
        return true
      }
    })

    // 根据模版新建文件
    const resourcePath = getExtensionFileAbsolutePath(context, `src/createPackage/templates/${config.typeOps[type].templateName}`)
    handleCopy({
      src: resourcePath,
      target: `${selectPath}/${directoryName}`,
      baseName,
      pkgName: directoryName.replace(/^_/, ''), // 包的名字要去除'_'开头符号
      description
    })

    vscode.window.setStatusBarMessage('创建完成！', 3000)
  })


  // 将registerCommand的返回值放入subscriptions可以自动执行内存回收逻辑
  context.subscriptions.push(disposable)
}