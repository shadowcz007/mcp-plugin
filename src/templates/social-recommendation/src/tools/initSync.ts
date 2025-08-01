// src/tools/initSync.ts
import { tools } from './index'
import { TOOLS_PREFIX } from './base_utils/const'

export const initializeSync = async (client: any) => {
  console.log('🔄 [初始化同步] 开始执行...')

  if (!client || !client.createDatabase) {
    console.error('❌ [初始化同步] client参数无效，缺少createDatabase方法')
    return
  }

  for (const tool of tools) {
    const toolName = tool.name
    // 检查是否是查询工具且配置了同步
    if (toolName.startsWith(TOOLS_PREFIX.QUERY) && tool.handler) {
      const tableName = toolName.replace(`${TOOLS_PREFIX.QUERY}_`, '')
      console.log(`🔄 [初始化同步] 正在同步 ${tableName}...`)
      
      try {
        // 构造查询参数 - 使用简单的查询来触发同步和初始化逻辑
        const args = {
          sql: `SELECT * FROM ${tableName} LIMIT 1`
        }
        
        // 使用正确的参数结构调用工具处理器
        await tool.handler(args, client, console.log)
        
        console.log(`✅ [初始化同步] ${tableName} 同步完成`)
      } catch (error) {
        console.error(`❌ [初始化同步] ${tableName} 同步失败:`, error)
      }
    }
  }

  console.log('🎉 [初始化同步] 所有工具同步完成')
}