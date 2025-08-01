import { z as zod } from 'zod'
import { tools, initializeSync } from './tools'
import path from 'path'
import { GUIDE } from './data'

declare global {
  var databasePath: string
  var userId: string
  var userName: string
  var serverApi: string
}

interface ExeTools {
  callTool: (toolName: string, args: any) => Promise<any>
  hasToolAvailable: (toolName: string) => boolean
  listTools: () => Array<any>
  findTool: (toolName: string) => any
  createDatabase: (databasePath: string) => Promise<any>
}

interface Server {
  tool: (
    name: string,
    description: string,
    schema: Record<string, any>,
    handler: (
      args: any,
      { sendNotification }: { sendNotification: any }
    ) => Promise<any>
  ) => void
  _client: ExeTools
  _sendLoggingMessage: (message: any) => void
}

interface ResourceTemplate {
  // ResourceTemplate 接口可以根据实际需求扩展
}

// 解析命令行参数获取数据库路径
function getDatabasePathFromArgs (): string {
  const defaultPath = path.join(process.cwd(), 'social.sqlite')
  const args = process.argv.slice(2)

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--database-path' || args[i] === '-d') {
      const dbPath = args[i + 1]
      if (!dbPath) {
        console.warn('警告: 数据库路径参数未提供，使用默认路径:', defaultPath)
        return defaultPath
      }
      return dbPath
    }
  }

  console.warn('警告: 未指定数据库路径参数，使用默认路径:', defaultPath)
  return defaultPath
}

function getUserIdFromArgs (): string {
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--user-id' || args[i] === '-u') {
      const userId = args[i + 1]
      if (!userId) {
        console.warn('警告: 用户ID参数未提供，使用默认:', 'unknow')
        return 'unknow'
      }
      return userId
    }
  }
  console.warn('警告: 未指定用户ID参数，使用默认:', 'unknow')
  return 'unknow'
}

function getUserNameFromArgs (): string {
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--user-name' || args[i] === '-n') {
      const userName = args[i + 1]
      if (!userName) {
        console.warn('警告: 用户名称参数未提供，使用默认:', 'unknow')
        return 'unknow'
      }
      return userName
    }
  }
  console.warn('警告: 未指定用户名称参数，使用默认:', 'unknow')
  return 'unknow'
}

function getServerApiFromArgs (): string {
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--server-api' || args[i] === '-a') {
      const serverUrl = args[i + 1]
      if (!serverUrl) {
        console.warn('警告: server-api未提供，使用默认:', 'http://localhost:3003/api')
        return 'http://localhost:3003/api'
      }
      return serverUrl
    }
  }
  console.warn('警告: 未指定server-api，使用默认:', 'http://localhost:3003/api')
  return 'http://localhost:3003/api'
}

global.databasePath = getDatabasePathFromArgs()
global.userId = getUserIdFromArgs()
global.userName = getUserNameFromArgs()
global.serverApi = getServerApiFromArgs()
console.log('🔧 [CONFIG] databasePath:', global.databasePath)
console.log('🔧 [CONFIG] userId:', global.userId)
console.log('🔧 [CONFIG] userName:', global.userName)
console.log('🔧 [CONFIG] serverApi:', global.serverApi)

console.log('🔧-------------------- ')
console.log('PROMPT:', GUIDE)
console.log('🔧-------------------- ')

export function configureMcp (
  server: Server,
  ResourceTemplate?: ResourceTemplate,
  z: typeof zod = zod
) {
  console.log('🔧 [CONFIG] Starting tool configuration...')
  try {
    for (const key in tools) {
      let tool = tools[key]
      console.log(`🔧 [CONFIG] Registering ${tool.name} tool...`)

      server?.tool(
        tool.name,
        tool.description.replace('${userName}', global.userName),
        // @ts-ignore
        z._fieldsToZodSchema(tool.fields, false),
        (args: any, { sendNotification }) => {
          return tool.handler(args, server._client, sendNotification)
        }
      )
 
      console.log(`✅ [CONFIG] ${tool.name} tool registered successfully`)
    }

    // 在工具配置完成后执行初始化同步
    console.log('🔧 [CONFIG] 工具配置完成，开始执行初始化同步...')
    initializeSync(server._client).catch(error => {
      console.error('❌ [CONFIG] 初始化同步过程中发生错误:', error)
    })

    console.log('🎉 [CONFIG] All tools configured successfully!')
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        `❌ [CONFIG] Error during tool configuration: ${error.message}`
      )
    } else {
      console.error(
        '❌ [CONFIG] An unknown error occurred during tool configuration'
      )
    }
    throw error
  }
} 