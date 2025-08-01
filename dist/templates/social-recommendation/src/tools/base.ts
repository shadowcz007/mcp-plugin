import {
  TOOLS_PREFIX,
  BASE_FIELDS_CONFIG,
  generateFieldDefs,
  generateFieldInsertParams,
  createRecordHandler,
  createUpdateHandler,
  createQueryHandler,
  ToolDefinition
} from './base_utils'

export const createTool = (config: ToolDefinition) => {
  const tableName = config.name
  const fields = [...BASE_FIELDS_CONFIG, ...config.fields]

  // 动态生成表字段相关数据
  const fieldNames = fields.map(f => f.name)
  const fieldDefs = generateFieldDefs(fields)
  const fieldInsertParams = generateFieldInsertParams(
    fields,
    BASE_FIELDS_CONFIG
  )

  const tools = config.tools || {}
  const finalTools: any = {}

  // 创建记录工具
  if (tools.record?.active) {
    finalTools[TOOLS_PREFIX.RECORD] = {
      name: TOOLS_PREFIX.RECORD + '_' + config.name,
      description: `记录到 ${tableName} 表中`,
      fields: [...config.fields],
      handler: createRecordHandler(
        tableName,
        fieldDefs,
        fieldNames,
        fieldInsertParams,
        config
      )
    }
  }

  // 创建更新工具
  if (tools.update?.active) {
    finalTools[TOOLS_PREFIX.UPDATE] = {
      name: TOOLS_PREFIX.UPDATE + '_' + config.name,
      description: `更新 ${tableName} 表中的记录`,
      fields: [...config.fields],
      handler: createUpdateHandler(
        tableName,
        fieldDefs,
        fieldNames,
        fieldInsertParams,
        config
      )
    }
  }

  // 创建查询工具
  if (tools.query?.active) {
    console.log('🔧 [CONFIG] userId:', globalThis.userId)
    console.log('🔧 [CONFIG] deviceId:', globalThis.deviceId)

    let fieldNamesForQuery = fieldNames.filter(
      f => f !== 'create_time' && f !== 'update_time'
    );

    if (tools.query?.excludeFields?.length > 0) {
      // 要排除
      fieldNamesForQuery = fieldNamesForQuery.filter(f => !tools.query?.excludeFields.includes(f))
    }

    finalTools[TOOLS_PREFIX.QUERY] = {
      name: TOOLS_PREFIX.QUERY + '_' + config.name,
      description: `通过自定义SQL语句查询数据库 ${tableName} 表,关键字段为 ${fieldNamesForQuery.join(
        ', '
      )} ，user_id 为 ${globalThis.userId} ，device_id 为 ${globalThis.deviceId
        },不要出现没有在数据库表里的字段`,
      fields: [
        {
          name: 'sql',
          type: 'string',
          description: '自定义SQLite语句',
          isOptional: false
        }
      ],
      handler: createQueryHandler(
        tableName,
        fieldDefs,
        fieldNames,
        fieldInsertParams,
        config
      )
    }
  }

  return finalTools
}
