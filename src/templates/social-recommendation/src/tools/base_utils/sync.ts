import { TOOLS_PREFIX } from './const'

// 同步到后端的函数
export const syncToBackend = async (
  operation: string,
  tableName: string,
  fieldDefs: any,
  data: any,
  whereObj?:any
) => {
  try {
    const BASE_URL = globalThis.serverApi || 'http://localhost:3003/api'
    const endpoints = {
      [TOOLS_PREFIX.QUERY]: `${BASE_URL}/${tableName}/${TOOLS_PREFIX.QUERY}`,
      [TOOLS_PREFIX.UPDATE]: `${BASE_URL}/${tableName}/${TOOLS_PREFIX.UPDATE}`,
      [TOOLS_PREFIX.RECORD]: `${BASE_URL}/${tableName}/${TOOLS_PREFIX.RECORD}`
    }

    let endpoint = endpoints[operation]
    if (!endpoint) {
      throw new Error(`未知的操作类型: ${operation}`)
    }

    // 获取表结构信息
    const tableStructure = {
      tableName,
      fieldDefs
    }

    const requestData = {
      whereObj,
      data,
      tableStructure
    }

    const options: RequestInit = {
      method:
        operation === TOOLS_PREFIX.QUERY
          ? 'POST'
          : operation === TOOLS_PREFIX.UPDATE
          ? 'PUT'
          : 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }

    options.body = JSON.stringify(requestData)

    const response = await fetch(endpoint, options)

    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} endpoint:${endpoint}`)
    }

    const result = await response.json()
    console.log(`同步成功: ${operation}`, requestData, result)
    return result
  } catch (error) {
    console.error('同步失败:', error)
    return false
  }
}

export const syncDataToLocal = async (
  db: any,
  tableName: string,
  fieldNames: string[],
  dataArray: any[]
) => {
  if (!dataArray || dataArray.length === 0) {
    console.log('🔧 没有数据需要同步到本地')
    return
  }

  let updatedCount = 0
  let insertedCount = 0

  for (const element of dataArray) {
    console.log('🔧 同步数据到本地:element', element)
    try {
      // 检查本地是否已存在该记录
      const checkStmt = db.prepare(`SELECT id FROM ${tableName} WHERE id = ?`)
      const existingRecord = checkStmt.getAsObject([element.id])
      checkStmt.free()

      if (existingRecord.id) {
        // 如果记录存在，则更新
        const updateFields = fieldNames
          .filter(f => f !== 'id')
          .map(f => `${f} = ?`)
          .join(', ')
        const updateValues = fieldNames
          .filter(f => f !== 'id')
          .map(f => element[f] || '')

        const updateStmt = db.prepare(
          `UPDATE ${tableName} SET ${updateFields} WHERE id = ?`
        )
        updateStmt.run([...updateValues, element.id])
        updateStmt.free()
        updatedCount++
        console.log(`🔧 更新本地记录 ID: ${element.id}`)
      } else {
        // 如果记录不存在，则插入
        const insertFields = fieldNames.join(', ')
        const insertPlaceholders = fieldNames.map(() => '?').join(', ')
        const insertValues = fieldNames.map(f => element[f] || '')

        const insertStmt = db.prepare(
          `INSERT INTO ${tableName} (${insertFields}) VALUES (${insertPlaceholders})`
        )
        insertStmt.run(insertValues)
        insertStmt.free()
        insertedCount++
        console.log(`🔧 插入本地记录 ID: ${element.id}`)
      }
    } catch (error) {
      console.error(`🔧 同步记录失败 ID: ${element.id}`, error)
    }
  }

  // 保存数据库文件
  db._saveDBFile()
  console.log(
    `🔧 本地数据库同步完成 - 更新: ${updatedCount}条, 插入: ${insertedCount}条`
  )
}
