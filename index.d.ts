import type { Application, Router } from 'express'

export type createExpressApp = (
  /** dimple-express的配置项 */
  config: DimpleExpressConfig,
) => Promise<DimpleExpressContext & { start: (cb: (context: DimpleExpressContext) => any) => any }>

export type DimpleExpressContext = { app: Application; router: Router; config: DimpleExpressConfig }

export type DimpleExpressConfig = {
  /** 服务启动的目录 */
  cwd?: string

  /** 路由的统一前缀 */
  routerPrefix?: string

  /** 启动服务的端口号 */
  port?: number

  /** 模块化插件的文件夹。默认是src/plugins */
  pluginsDir?: string

  /** 模块化接口的文件夹。默认是src/apis */
  apisDir?: string
}

export type DimpleExpressModule = (context: DimpleExpressContext) => any

export type DimpleCli = (
  /** dimple-express的配置项 */
  config: DimpleExpressConfig,
) => Promise<DimpleExpressContext & { start: (cb: (context: DimpleExpressContext) => any) => any }>

export type createCliApp = (config: any) => Promise<any>
