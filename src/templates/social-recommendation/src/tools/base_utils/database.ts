/**
 * 数据库相关的工具函数
 */

/**
 * 初始化数据库表
 */
export const initDB = async (
  tableName: string,
  fieldDefs: string,
  createDatabase: any
) => {
  const currentDb = await createDatabase(globalThis.databasePath)

  currentDb.run(`CREATE TABLE IF NOT EXISTS ${tableName} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ${fieldDefs}
  )`)
  return currentDb
}

/**
 * 将字段类型映射为 SQLite 数据类型
 */
export const mapFieldTypeToSQLType = (fieldType: string): string => {
  switch (fieldType) {
    case 'string':
      return 'TEXT'
    case 'number':
      return 'REAL'
    case 'boolean':
      return 'INTEGER'
    case 'datetime':
      return 'INTEGER'// 秒级时间戳
    default:
      return 'TEXT'
  }
}

/**
 * 生成表字段定义
 */
export const generateFieldDefs = (fields: any[]): string => {
  return fields
    .map(f => `${f.name} ${mapFieldTypeToSQLType(f.type)}`)
    .join(',\n        ')
}

/**
 * 生成字段插入参数的默认值
 */
export const generateFieldInsertParams = (fields: any[], baseFieldsConfig: any[]): Record<string, any> => {
  return fields.reduce((acc, f) => {
    let value = baseFieldsConfig.find(c => c.name === f.name)?.defaultValue || ''
    acc[`$${f.name}`] = value
    return acc
  }, {} as Record<string, any>)
}

/**
 * 检查表中的记录数量
 */
export const getTableRecordCount = (db: any, tableName: string): number => {
  const checkStmt = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
  let count = 0
  if (checkStmt.step()) {
    const result = checkStmt.getAsObject()
    count = result.count || 0
  }
  checkStmt.free()
  return count
}

/**
 * 获取所有表的结构信息
 */
export const getAllTablesStructure = (db: any): any[] => {
  const sql = `SELECT name AS table_name, sql FROM sqlite_master WHERE type = 'table'`
  const result = []
  try {
    const stmt = db.prepare(sql)
    while (stmt.step()) {
      let table = stmt.getAsObject()
      if (table.name !== 'sqlite_sequence') {
        result.push(table)
      }
    }
    stmt.free()
  } catch (error) {
    console.error('获取表结构失败:', error)
  }
  return result
} 