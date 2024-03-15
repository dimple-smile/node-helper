import express from 'express'
import glob from 'fast-glob'
import { dirname, resolve, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 动态加载模块
 * @param { import('./type').DimpleExpressContext } context
 * @returns { Promise<any> } 模块import的promise list
 */
const loadExpressModules = async (type, context) => {
  const { config } = context
  const cwd = config.cwd || process.cwd()
  let modulesDir = ''
  if (type === 'plugins') modulesDir = config.pluginsDir || 'src/plugins'
  if (type === 'apis') modulesDir = config.apisDir || 'src/apis'
  const modulesDirPath = resolve(cwd, modulesDir)
  const relativePath = relative(__dirname, modulesDirPath)

  const modules = await glob(`${modulesDir}/*/index.js`, { cwd })
  if (modules.length === 0) return
  return Promise.all(
    modules.map((item) => {
      let importPath = relativePath + item.replace(modulesDir, '')
      importPath = importPath.replaceAll('\\', '/')
      return import(importPath).then((module) => module?.default?.(context))
    }),
  )
}

/** @type {import('./type').DimpleExpress} */
const createExpressApp = async (config) => {
  const app = express()
  const router = express.Router()
  const context = { app, config, router }

  // 需要等插件加载完成后，再加载api
  await loadExpressModules('plugins', context)
  loadExpressModules('apis', context)

  const routerPrefix = config.routerPrefix ?? '/api/frontend'
  app.use(routerPrefix, router)

  const start = (cb) => {
    app.listen(config.port, () => {
      if (cb) return cb(context)
      console.log(`dimple-express listening on port ${config.port}`)
    })
  }

  context.start = start

  return context
}

/** @type {import('./type').DimpleExpress} */
const createCliApp = async (options) => {
  if (!options) options = {}
  if (!options.cwd) options.cwd = process.cwd()

  const { cwd } = options

  const commandArgv = process.argv.splice(2)
  const command = commandArgv[0] || 'help'

  const globCwd = resolve(cwd, 'src/commands')
  const modules = await glob('*', { cwd: globCwd, onlyDirectories: true })

  const relativePath = relative(__dirname, globCwd)

  const modulesData = await Promise.all(
    modules.map((item) => {
      let importPath = relativePath
      importPath = importPath.replaceAll('\\', '/')
      return import(`${importPath}/${item}/index.js`).then((module) => {
        const itemData = module?.default || {}
        if (!itemData.name) itemData.name = item
        return itemData
      })
    }),
  )

  const module = modulesData.find((item) => {
    if (item.name === command) return true
    if (item?.alias?.includes(command)) return true
    return false
  })

  if (module && module) module.handle(commandArgv, options)
}

export { createExpressApp, createCliApp }
