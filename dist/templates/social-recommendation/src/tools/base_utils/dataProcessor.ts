/**
 * 数据处理相关的工具函数
 */

/**
 * 根据字段类型处理值
 */
export const processValueByFieldType = (value: any, fieldType: string): any => {
  switch (fieldType) {
    case 'string':
      return String(value)
    case 'number':
      return Number(value)
    case 'boolean':
      return Boolean(value) ? 1 : 0
    case 'array':
      // 数组类型转换为JSON字符串存储
      return Array.isArray(value) ? JSON.stringify(value) : String(value)
    case 'datetime':
      return value instanceof Date ? Math.floor(value.getTime() / 1000) : value
    default:
      return String(value)
  }
}

/**
 * 处理默认值，按照字段类型要求转换
 */
export const processDefaultValues = (
  defaultValues: Record<string, any>,
  fields: any[],
  fieldInsertParams: Record<string, any>
): Record<string, any> => {
  const processedDefaultValues: any = {
    ...fieldInsertParams,
    $create_time: Math.floor(new Date().getTime() / 1000), //秒级时间戳
    $update_time: Math.floor(new Date().getTime() / 1000) //秒级时间戳
  }

  // 根据字段定义处理默认值
  for (const field of fields) {
    if (defaultValues[field.name] !== undefined) {
      const value = defaultValues[field.name]
      processedDefaultValues[`$${field.name}`] = processValueByFieldType(
        value,
        field.type
      )
    }
  }

  return processedDefaultValues
}

/**
 * 准备插入参数
 */
export const prepareInsertParams = (
  args: any,
  fieldNames: string[],
  fieldInsertParams: Record<string, any>
): Record<string, any> => {
  const insertParams: any = {
    ...fieldInsertParams,
    "$create_time": Math.floor(new Date().getTime() / 1000), //秒级时间戳
    "$update_time": Math.floor(new Date().getTime() / 1000) //秒级时间戳
  }

  for (const key of fieldNames) {
    insertParams[`$${key}`] = args[key] || insertParams[`$${key}`]
  }

  return insertParams
}

/**
 * 准备更新参数
 */
export const prepareUpdateParams = (
  args: any,
  fieldNames: string[],
  fieldInsertParams: Record<string, any>
): Record<string, any> => {
  console.log('🔧 prepareUpdateParams:args', args)
  console.log('🔧 prepareUpdateParams:fieldNames', fieldNames)
  console.log('🔧 prepareUpdateParams:fieldInsertParams', fieldInsertParams)
  const updateParams: any = {
    create_time: Math.floor(new Date().getTime() / 1000), //秒级时间戳
    update_time: Math.floor(new Date().getTime() / 1000) //秒级时间戳
  }

  for (const key of fieldNames) {
    fieldInsertParams[`$${key}`] =
      args[key] || updateParams[key] || fieldInsertParams[`$${key}`]
  }

  return fieldInsertParams
}
