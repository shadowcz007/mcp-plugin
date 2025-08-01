const fixOrderBy = (sql: string, lowerFieldNames: string[]) => {
    // 更精确的正则表达式匹配 ORDER BY 子句
    // 修改正则表达式以更好地处理空字段名的情况
    const orderByMatch = sql.match(/ORDER\s+BY\s*([^;]*?)(?=\s+LIMIT|$)/i)
    if (orderByMatch) {
        const orderByClause = orderByMatch[1].trim()

        // 处理空的ORDER BY子句（ORDER BY后面没有内容或只有空格）
        if (!orderByClause || orderByClause === '' || orderByClause.toLowerCase().startsWith('limit')) {
            console.error('🔍 发现空的ORDER BY子句')
            // 更精确地移除ORDER BY子句，保留LIMIT
            sql = sql.replace(/ORDER\s+BY\s*(?=\s+LIMIT)/i, '').replace(/ORDER\s+BY\s*$/i, '').replace(/\s+/g, ' ').trim()
            return sql
        }

        // 解析 ORDER BY 字段，处理多个字段和 ASC/DESC
        const orderByFields = orderByClause.split(',').map(field => {
            // 移除 ASC/DESC 和多余空格，只保留字段名
            let cleanField = field.trim().replace(/\s+(ASC|DESC)$/i, '').trim()

            // 处理反引号包围的字段名
            if (cleanField.startsWith('`') && cleanField.endsWith('`')) {
                cleanField = cleanField.slice(1, -1)
            }

            return cleanField
        })

        // 检查字段是否在允许范围内（忽略大小写）
        const invalidFields = orderByFields.filter(field =>
            !lowerFieldNames.includes(field.toLowerCase())
        )

        if (invalidFields.length > 0) {
            console.error('🔍 发现无效字段:', invalidFields)
            console.error('🔍 允许的字段:', lowerFieldNames)
            // 移除整个 ORDER BY 子句 - 使用更精确的替换
            sql = sql.replace(/ORDER\s+BY\s+[^;]*?(?=\s+LIMIT)/i, '').replace(/ORDER\s+BY\s+[^;]*?$/i, '').replace(/\s+/g, ' ').trim()
            return sql
        }
    }
    return sql
}

//还可能出现不在数据库表里的字段 ：
// 查询SQL: SELECT * FROM community_info WHERE user_id = 'shadow' AND device_id = 'm001' ORDER BY timestamp DESC LIMIT 1
// ❌ SQL执行错误: SqliteError: no such column: timestamp

/**
 * 修正 SQL 语句中 ORDER BY 和 LIMIT 的顺序
 * @param {string} sql - 原始 SQL 查询语句
 * @returns {string} 修正后的 SQL 查询语句
 */
export function fixSqlClauseOrder(sql: string, fieldNames: string[]) {
    // 保存原始SQL以保持大小写，并规范化空格
    let originalSql = sql.replace(/\s+/g, ' ').trim()
    
    // 转换为小写便于匹配
    let lowerSql = originalSql.toLowerCase()
  
    // 将 fieldNames 转换为小写以便比较
    const lowerFieldNames = fieldNames.map(name => name.toLowerCase())
  
    // 检查是否同时包含 ORDER BY 和 LIMIT
    let hasOrderBy = lowerSql.includes('order by')
    let hasLimit = lowerSql.includes('limit')
  
    if (hasOrderBy) {
      // 使用原始SQL进行字段验证，但保持大小写
      const fixedSql = fixOrderBy(originalSql, lowerFieldNames)
      if (fixedSql !== originalSql) {
        originalSql = fixedSql
        lowerSql = fixedSql.toLowerCase()
        hasOrderBy = lowerSql.includes('order by')
        hasLimit = lowerSql.includes('limit')
      }
    }
  
    if (!hasOrderBy || !hasLimit) {
      return originalSql
    }
  
    const orderByPos = lowerSql.indexOf('order by')
    const limitPos = lowerSql.indexOf('limit')
  
    if (orderByPos < limitPos) {
      return originalSql
    }
  
    try {
      // 提取ORDER BY和LIMIT子句
      const orderByMatch = originalSql.match(/ORDER\s+BY\s+([^;]*?)(?=\s+LIMIT|$)/i)
      const limitMatch = originalSql.match(/LIMIT\s+(\d+)/i)

      // 如果ORDER BY在LIMIT之后，需要重新排序
      if (orderByMatch && limitMatch) {
        // 移除现有的ORDER BY和LIMIT子句
        let cleanSql = originalSql
          .replace(/\s+ORDER\s+BY\s+[^;]*?(?=\s+LIMIT|$)/gi, '')
          .replace(/\s+LIMIT\s+\d+/gi, '')
          .replace(/ORDER\s+BY\s+[^;]*$/gi, '')
          .replace(/\s+/g, ' ')
          .trim()

        // 按正确顺序重新添加
        cleanSql += ` ORDER BY ${orderByMatch[1].trim()} LIMIT ${limitMatch[1]}`
        return cleanSql
      }

      return originalSql
    } catch (e) {
      console.error('修正 SQL 顺序时出错:', e)
      return originalSql
    }
  }
  