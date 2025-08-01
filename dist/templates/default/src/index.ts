import { z as zod } from 'zod'
import { tools } from './tools'
import path from 'path'

interface Client {
  callTool: (toolName: string, args: any) => Promise<any>
  hasToolAvailable: (toolName: string) => Promise<boolean>
  listTools: () => Promise<Array<any>>
  findTool: (toolName: string) => Promise<any>
  createDatabase: () => Promise<any>
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
  _client: Client
  _sendLoggingMessage: (message: any) => void
}

interface ResourceTemplate {
  // ResourceTemplate 接口可以根据实际需求扩展
}

function getArgFromArgs (
  longName: string,
  shortName: string,
  defaultValue: string,
  warnMsg: string
): string {
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    if (args[i] === longName || args[i] === shortName) {
      const value = args[i + 1]
      if (!value) {
        console.warn(`警告: ${warnMsg}，使用默认:`, defaultValue)
        return defaultValue
      }
      return value
    }
  }
  console.warn(`警告: 未指定${warnMsg}，使用默认:`, defaultValue)
  return defaultValue
}

declare global {
  var databasePath: string
  var userId: string
  var userName: string
}
// 获取参数
globalThis.databasePath = getArgFromArgs(
  '--database-path',
  '-d',
  path.join(process.cwd(), 'database.sqlite'),
  '数据库路径参数未提供'
)
globalThis.userId = getArgFromArgs(
  '--user-id',
  '-u',
  'unknow',
  '用户ID参数未提供'
)
globalThis.userName = getArgFromArgs(
  '--user-name',
  '-n',
  'unknow',
  '用户名称参数未提供'
)
console.log('🔧 [CONFIG] databasePath:', globalThis.databasePath)
console.log('🔧 [CONFIG] userId:', globalThis.userId)
console.log('🔧 [CONFIG] userName:', globalThis.userName)

export function configureMcp (
  server: Server,
  ResourceTemplate?: ResourceTemplate,
  z: typeof zod = zod
) {
  console.log('🔧 [CONFIG] Starting tool configuration...')
  // console.log('server._exe_tools',server._exe_tools)
  // server._sendLoggingMessage
  try {
    for (const key in tools) {
      let tool = tools[key]
      // 添加一个简单的测试工具
      console.log(`🔧 [CONFIG] Registering ${tool.name} tool...`)

      server?.tool(
        tool.name,
        tool.description,
        tool.schema,
        (args: any, e: any) => {
          const sendNotification = e?.sendNotification || (() => {})
          return tool.handler(args, server._client, sendNotification)
        }
      )

      console.log(`✅ [CONFIG] ${tool.name} tool registered successfully`)
    }

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
