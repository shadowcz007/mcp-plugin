import { z as zod } from 'zod'
import { tools } from './tools'

interface ExeTools {
  callTool: (toolName: string, args: any) => Promise<any>
  hasToolAvailable: (toolName: string) => boolean
  listTools: () => Array<any>
  findTool: (toolName: string) => any
}

interface Server {
  tool: (
    name: string,
    description: string,
    schema: Record<string, any>,
    handler: (args: any, { sendNotification }: { sendNotification: any }) => Promise<any>
  ) => void
  _exe_tools: ExeTools
  _sendLoggingMessage: (message: any) => void
}

interface ResourceTemplate {
  // ResourceTemplate 接口可以根据实际需求扩展
}

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
        (args: any, { sendNotification }) => {
          return tool.handler(args, server._exe_tools, sendNotification)
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
