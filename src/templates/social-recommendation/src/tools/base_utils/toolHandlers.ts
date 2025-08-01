/**
 * 工具处理器相关的函数
 */

import { syncDataToLocal, syncToBackend } from './sync'
import { TOOLS_PREFIX } from './const'
import { initDB, getTableRecordCount, getAllTablesStructure } from './database'
import { validateSQLSafety } from './validation'
import {
  processDefaultValues,
  prepareInsertParams,
  prepareUpdateParams
} from './dataProcessor'
import { fixSqlClauseOrder } from './fixSql'
import { excludeFieldsSql } from './excludeFieldsSql'
/**
 * 创建记录工具处理器
 */
export const createRecordHandler = (
  tableName: string,
  fieldDefs: string,
  fieldNames: string[],
  fieldInsertParams: Record<string, any>,
  config: any
) => {
  return async (args: any, client: any, sendNotification: any) => {
    console.log('🎯 [创建记录] 开始处理...')
    console.log('🎯 [创建记录] 表名:', tableName)
    console.log('🎯 [创建记录] 字段定义:', fieldDefs)
    console.log('🎯 [创建记录] 字段名称:', fieldNames)
    console.log('🎯 [创建记录] 工具参数:', args)
    console.log('🎯 [创建记录] 配置信息:', config)

    const { createDatabase } = client
    console.log('🎯 [创建记录] 初始化数据库...')
    const currentDb = await initDB(tableName, fieldDefs, createDatabase)

    console.log('🎯 [创建记录] 准备插入参数...')
    const insertParams = prepareInsertParams(
      args,
      fieldNames,
      fieldInsertParams
    )
    console.log('🎯 [创建记录] 插入参数:', insertParams)

    const sqlQuery = `INSERT INTO ${tableName} (${fieldNames.join(
      ', '
    )}) VALUES (${fieldNames.map(f => `$${f}`).join(', ')})`
    console.log('🎯 [创建记录] SQL语句:', sqlQuery)

    const stmt = currentDb.prepare(sqlQuery)
    console.log('🎯 [创建记录] 执行插入操作...')
    stmt.run(insertParams)
    stmt.free()
    currentDb._saveDBFile()
    console.log('🎯 [创建记录] 数据库保存完成')

    // 如果配置了同步，则同步到后端
    const tools = config.tools || {}
    const shouldSyncToBackend = tools[TOOLS_PREFIX.RECORD]?.syncToBackend
    console.log('🎯 [创建记录] 是否需要同步到后端:', shouldSyncToBackend)

    if (shouldSyncToBackend) {
      console.log('🎯 [创建记录] 开始同步到后端...')
      await syncToBackend(
        TOOLS_PREFIX.RECORD,
        tableName,
        fieldDefs,
        insertParams
      )
      console.log('🎯 [创建记录] 后端同步完成')
    }

    console.log('🎯 [创建记录] 处理完成')
    return {
      content: [
        {
          type: 'text',
          text: `完成记录${shouldSyncToBackend ? '并同步到后端' : ''}`
        }
      ]
    }
  }
}

/**
 * 创建更新工具处理器
 */
export const createUpdateHandler = (
  tableName: string,
  fieldDefs: string,
  fieldNames: string[],
  fieldInsertParams: Record<string, any>,
  config: any
) => {
  return async (args: any, client: any, sendNotification: any) => {
    console.log('🔄 [更新记录] 开始处理...')
    console.log('🔄 [更新记录] 表名:', tableName)
    console.log('🔄 [更新记录] 字段定义:', fieldDefs)
    console.log('🔄 [更新记录] 字段名称:', fieldNames)
    console.log('🔄 [更新记录] 工具参数:', args)
    // console.log('🔄 [更新记录] 配置信息:', config)

    const updateByFields = config.tools?.update?.updateByFields

    const { createDatabase } = client
    console.log('🔄 [更新记录] 初始化数据库...')
    const currentDb = await initDB(tableName, fieldDefs, createDatabase)

    // 检查记录是否存在
    console.log('🔄 [更新记录] 检查记录数量...')
    const recordCount = getTableRecordCount(currentDb, tableName)
    console.log('🔄 [更新记录] 当前记录数:', recordCount)

    console.log('🔄 [更新记录] 准备更新参数...')
    const updateParams = prepareUpdateParams(
      args,
      fieldNames,
      fieldInsertParams
    )
    console.log('🔄 [更新记录] 更新参数:', updateParams)

    if (recordCount === 0) {
      console.log('🔄 [更新记录] 记录不存在，执行插入操作...')
      // 如果不存在记录，则插入
      console.log('🔄 [更新记录] 添加创建时间:', updateParams['$create_time'])

      const insertSql = `INSERT INTO ${tableName} (${fieldNames.join(
        ', '
      )}) VALUES (${fieldNames.map(f => `$${f}`).join(', ')})`
      console.log('🔄 [更新记录] 插入SQL:', insertSql)

      const insertStmt = currentDb.prepare(insertSql)
      console.log('🔄 [更新记录] 执行插入...', updateParams)
      insertStmt.run(updateParams)
      insertStmt.free()
      console.log('🔄 [更新记录] 插入操作完成')
    } else {
      console.log('🔄 [更新记录] 记录存在，执行更新操作...')

      if (updateParams['$create_time']) delete updateParams['$create_time']

      let updateSql,updateByFieldsParams:any = {};

      if (updateByFields?.length > 0) {

        let ws = []
        for (const uf of updateByFields) {
          if (updateParams['$' + uf]) {
            ws.push(uf + " = " + JSON.stringify(updateParams['$' + uf]));
            updateByFieldsParams['$' + uf] = updateParams['$' + uf];
            delete updateParams['$' + uf];
          }
        }

        if (ws.length === updateByFields.length) {
          //完全匹配
          //有明确的更新定位
          updateSql = `UPDATE ${tableName} SET ${fieldNames.filter(f => !updateByFields.includes(f) && f != '$create_time')
            .map(f => `${f} = $${f}`)
            .join(', ')} WHERE ${ws.join(' AND ')}`
        } else {
          //新增

        }


      } else {
        // 如果存在记录，则更新第一条记录
        updateSql = `UPDATE ${tableName} SET ${fieldNames
          .map(f => `${f} = $${f}`)
          .join(', ')} WHERE id = 1`
      }

      console.log('🔄 [更新记录] 更新SQL:', updateSql)

      const updateStmt = currentDb.prepare(updateSql)
      console.log('🔄 [更新记录] 执行更新...', updateParams)
      const updateResult = updateStmt.run(updateParams)
      updateStmt.free()
      
      // 检查更新是否成功（受影响的行数）
      const affectedRows = updateResult.changes || 0
      console.log('🔄 [更新记录] 更新影响行数:', affectedRows)
      
      if (affectedRows === 0) {
        console.log('🔄 [更新记录] 更新失败，没有找到匹配的记录，开始插入新记录...')
        
        // 恢复create_time字段用于插入
        if (!updateParams['$create_time']) {
          updateParams['$create_time'] = new Date().toISOString()
        }

       
        const insertSql = `INSERT INTO ${tableName} (${fieldNames.join(
          ', '
        )}) VALUES (${fieldNames.map(f => `$${f}`).join(', ')})`
        console.log('🔄 [更新记录] 插入SQL:', insertSql)
        
        const insertStmt = currentDb.prepare(insertSql)
        console.log('🔄 [更新记录] 执行插入...', { ...updateParams, ...updateByFieldsParams })
        insertStmt.run({ ...updateParams, ...updateByFieldsParams })
        insertStmt.free()
        console.log('🔄 [更新记录] 插入操作完成')
      } else {
        console.log('🔄 [更新记录] 更新操作完成')
      }
    }

    console.log('🔄 [更新记录] 保存数据库文件...')
    currentDb._saveDBFile()

    // 如果配置了同步，则同步到后端
    const tools = config.tools || {}
    const shouldSyncToBackend = tools[TOOLS_PREFIX.UPDATE]?.syncToBackend
    console.log('🔄 [更新记录] 是否需要同步到后端:', shouldSyncToBackend)

    if (shouldSyncToBackend) {
      //获取更新后的数据
      const updateSql = `SELECT * FROM ${tableName} ORDER BY update_time DESC LIMIT 1`
      const updateStmt = currentDb.prepare(updateSql)

      let updateResult = null
      if (updateStmt.step()) {
        updateResult = updateStmt.getAsObject()
      }
      updateStmt.free()
      console.log('🔄 [更新记录] 更新后的数据:', updateResult)



      console.log('🔄 [更新记录] 开始同步到后端...')

      // 添加 $ 前缀
      const paramsWithDollar = Object.entries(updateResult).reduce((acc: any, [key, value]) => {
        acc[`$${key}`] = value;
        return acc;
      }, {});

      let whereObj: any = null;
      if (updateByFields?.length > 0) {
        whereObj = {};
        if(paramsWithDollar['$id']) delete paramsWithDollar['$id']
        for (const key of updateByFields) {
          whereObj[key] = updateResult[key]
        }
      }

      await syncToBackend(
        TOOLS_PREFIX.UPDATE,
        tableName,
        fieldDefs,
        paramsWithDollar,
        whereObj
      )
      console.log('🔄 [更新记录] 后端同步完成')
    }

    console.log('🔄 [更新记录] 处理完成')
    return {
      content: [
        {
          type: 'text',
          text: `完成更新${shouldSyncToBackend ? '并同步到后端' : ''}`
        }
      ]
    }
  }
}

/**
 * 插入默认值到数据库
 */
export const insertDefaultValues = async (
  currentDb: any,
  tableName: string,
  fieldNames: string[],
  fieldDefs: string,
  config: any,
  fieldInsertParams: Record<string, any>
) => {
  console.log('📝 [默认值] 检查是否需要插入默认值...')
  if (!config.defaultValues) {
    console.log('📝 [默认值] 未配置默认值，跳过')
    return
  }

  console.log('📝 [默认值] 本地表为空，开始插入默认值')
  console.log('📝 [默认值] 原始默认值:', config.defaultValues)
  console.log('📝 [默认值] 字段配置:', config.fields)
  console.log('📝 [默认值] 插入参数模板:', fieldInsertParams)

  const processedDefaultValues = processDefaultValues(
    config.defaultValues,
    config.fields,
    fieldInsertParams
  )
  console.log('📝 [默认值] 处理后的默认值:', processedDefaultValues)

  try {
    const insertSql = `INSERT INTO ${tableName} (${fieldNames.join(
      ', '
    )}) VALUES (${fieldNames.map(f => `$${f}`).join(', ')})`
    console.log('📝 [默认值] 插入SQL:', insertSql)

    const insertStmt = currentDb.prepare(insertSql)
    console.log('📝 [默认值] 执行插入操作...')
    insertStmt.run(processedDefaultValues)
    insertStmt.free()
    currentDb._saveDBFile()
    console.log('📝 [默认值] 默认值插入成功')

    // 如果配置了同步，同步默认值到后端（使用 update 模式）
    const tools = config.tools || {}
    const shouldSyncToBackend = tools[TOOLS_PREFIX.UPDATE]?.syncToBackend
    console.log('📝 [默认值] 是否需要同步默认值到后端:', shouldSyncToBackend)

    if (shouldSyncToBackend) {
      console.log('📝 [默认值] 开始同步默认值到后端...')
      await syncToBackend(
        TOOLS_PREFIX.UPDATE,
        tableName,
        fieldDefs,
        processedDefaultValues
      )
      console.log('📝 [默认值] 默认值已同步到后端')
    }
  } catch (error) {
    console.error('📝 [默认值] 插入默认值失败:', error)
    console.error('📝 [默认值] 错误详情:', JSON.stringify(error, null, 2))
  }
}

/**
 * 创建查询工具处理器
 */
export const createQueryHandler = (
  tableName: string,
  fieldDefs: string,
  fieldNames: string[],
  fieldInsertParams: Record<string, any>,
  config: any
) => {
  return async (args: any, client: any, sendNotification: any) => {
    console.log('🔍 [查询记录] 开始处理...')
    console.log('🔍 [查询记录] 表名:', tableName)
    console.log('🔍 [查询记录] 字段定义:', fieldDefs)
    console.log('🔍 [查询记录] 字段名称:', fieldNames)
    console.log('🔍 [查询记录] 查询参数:', args)
    // console.log('🔍 [查询记录] 配置信息:', config)

    const { createDatabase } = client
    // 如果有设置
    const limit = config.tools?.query?.limit || 3
    const orderBy = config.tools?.query?.orderBy;

    //todo 引入 sql的解析器

    // 验证SQL安全性
    console.log('🔍 [查询记录] 验证SQL安全性...')
    const validation = validateSQLSafety(args.sql)
    console.log('🔍 [查询记录] SQL安全性验证结果:', validation)

    if (!validation.isValid) {
      console.error('🔍 [查询记录] SQL安全性验证失败:', validation.errorMessage)
      return {
        content: [
          {
            type: 'text',
            text:
              validation.errorMessage ||
              '只允许安全的SELECT查询，不允许执行删除、修改等操作。'
          }
        ]
      }
    }

    // 修复SQL中的用户ID和设备ID参数
    console.log('🔍 [查询记录] 修复SQL参数前:', args.sql)

    // 替换各种可能的错误 user_id 值
    args.sql = args.sql.replace(
      /user_id\s*=\s*['"]?[^'"\s]+['"]?/gi,
      `user_id = '${globalThis.userId}'`
    )

    // 替换各种可能的错误 device_id 值
    args.sql = args.sql.replace(
      /device_id\s*=\s*['"]?[^'"\s]+['"]?/gi,
      `device_id = '${globalThis.deviceId}'`
    )

    // 排除查询字段的设定
    if (config.tools?.query?.excludeFields && config.tools?.query?.excludeFields.length > 0) {
      const excludeFields = config.tools?.query?.excludeFields
      // 需要把 where 语句提取出来，做过滤，然后重新拼接
      args.sql = excludeFieldsSql(args.sql, excludeFields)
    }

    if (orderBy && !args.sql.toLowerCase().includes('order by')) {
      args.sql = args.sql + ` ORDER BY ${orderBy}`
    } else if (orderBy) {
      // 需要采用替换策略
      args.sql = args.sql.replace(
        /ORDER\s*BY\s*[^'\s]+/gi,
        `ORDER BY ${orderBy}`
      )
    }

    // 判断是否设置了 limit
    if (args.sql.toLowerCase().includes('limit')) {
      args.sql = args.sql.replace(/LIMIT\s*[^'\s]+/gi, `LIMIT ${limit}`)
    } else {
      args.sql = args.sql + ` LIMIT ${limit}`
    }

    args.sql = fixSqlClauseOrder(args.sql, fieldNames)

    //🔍 查询SQL: SELECT * FROM social_tag_wall WHERE tag LIKE '%找书友%'; LIMIT 3 ORDER BY update_time DESC
    // ❌ SQL执行错误: RangeError: The supplied SQL string contains more than one statement

    // 移除除了末尾的 ; 以外的所有 ;
    // 移除WHERE子句后错误放置的分号
    args.sql = args.sql.replace(/;\s*(LIMIT|ORDER\s+BY|GROUP\s+BY|HAVING)/gi, ' $1')
    // 移除末尾分号
    args.sql = args.sql.replace(/;$/, '')

    console.log('🔍 [查询记录] 修复SQL参数后:', args.sql)


    console.log('🔍 [查询记录] 初始化数据库...')
    const currentDb = await initDB(tableName, fieldDefs, createDatabase)

    // 如果配置了同步，先从后端获取数据
    const tools = config.tools || {}
    const shouldSyncFromBackend = tools[TOOLS_PREFIX.QUERY]?.syncToBackend
    console.log('🔍 [查询记录] 是否需要从后端同步数据:', shouldSyncFromBackend)

    if (shouldSyncFromBackend) {
      console.log('🔍 [查询记录] 开始从后端同步数据...')
      const result: any = await syncToBackend(
        TOOLS_PREFIX.QUERY,
        tableName,
        fieldDefs,
        args.sql
      )
      console.log('🔍 [查询记录] 后端查询结果:', result)

      if (result.length > 0) {
        console.log('🔍 [查询记录] 同步数据到本地...')
        await syncDataToLocal(currentDb, tableName, fieldNames, result)
        console.log('🔍 [查询记录] 数据同步完成')
      } else {
        console.log('🔍 [查询记录] 后端无数据，跳过同步')
      }
    }

    // 检查本地表是否有数据，如果没有且有默认值，则插入默认值
    console.log('🔍 [查询记录] 检查本地表记录数量...')
    const recordCount = getTableRecordCount(currentDb, tableName)
    console.log('🔍 [查询记录] 本地记录数:', recordCount)

    if (recordCount === 0 || !recordCount) {
      console.log('🔍 [查询记录] 本地无数据，尝试插入默认值...')
      await insertDefaultValues(
        currentDb,
        tableName,
        fieldNames,
        fieldDefs,
        config,
        fieldInsertParams
      )
    }

    let result = [],
      errorInfo: string = ''

    try {
      console.log('🔍 [查询记录] 执行SQL查询:', args.sql)
      const stmt = currentDb.prepare(args.sql)
      while (stmt.step()) {
        const row = stmt.getAsObject()
        result.push(row)
        console.log('🔍 [查询记录] 查询行数据:', row)
      }
      stmt.free()
      console.log('🔍 [查询记录] 查询完成，总行数:', result.length)
    } catch (error: any) {
      errorInfo = error.message
      console.error('🔍 [查询记录] SQL执行出错:', errorInfo)
      console.error('🔍 [查询记录] 错误详情:', error)
    }

    console.log('🔍 [查询记录] 最终查询结果:', result)

    // 获取所有表的结构信息
    // console.log('🔍 [查询记录] 获取所有表结构信息...')
    const result2 = getAllTablesStructure(currentDb)
    // console.log('🔍 [查询记录] 表结构信息:', result2)

    // console.log('🔍 [查询记录] 处理完成')
    return {
      content: [
        {
          type: 'text',
          text: `查询结果: ${JSON.stringify(result)},所有表: ${JSON.stringify(
            result2
          )}${errorInfo ? `,SQL执行出错: ${errorInfo}` : ''}`
        }
      ]
    }
  }
}
