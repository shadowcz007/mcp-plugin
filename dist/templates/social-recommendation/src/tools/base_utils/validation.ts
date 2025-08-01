/**
 * 验证相关的工具函数
 */

/**
 * 检查SQL查询的安全性
 * 只允许SELECT查询，禁止危险操作
 */
export const validateSQLSafety = (sql: string): { isValid: boolean; errorMessage?: string } => {
  const forbidden = /\b(delete|drop|update|insert|alter|truncate)\b/i
  
  if (!/^\s*select\b/i.test(sql)) {
    return {
      isValid: false,
      errorMessage: '只允许SELECT查询语句'
    }
  }
  
  if (forbidden.test(sql)) {
    return {
      isValid: false,
      errorMessage: '不允许执行删除、修改等危险操作'
    }
  }
  
  return { isValid: true }
}

/**
 * 验证字段类型
 */
export const validateFieldType = (fieldType: string): boolean => {
  const allowedTypes = ['string', 'number', 'boolean', 'datetime', 'array']
  return allowedTypes.includes(fieldType)
}

/**
 * 验证字段配置
 */
export const validateFieldConfig = (field: any): { isValid: boolean; errorMessage?: string } => {
  if (!field.name || typeof field.name !== 'string') {
    return {
      isValid: false,
      errorMessage: '字段名称不能为空且必须为字符串'
    }
  }
  
  if (!field.type || !validateFieldType(field.type)) {
    return {
      isValid: false,
      errorMessage: `不支持的字段类型: ${field.type}`
    }
  }
  
  return { isValid: true }
} 