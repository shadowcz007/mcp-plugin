/**
 * base_utils 模块统一导出
 */

// 常量和配置
export { TOOLS_PREFIX, BASE_FIELDS_CONFIG } from "./const"

// 类型定义
export type { 
  FieldConfig, 
  ToolConfig, 
  ToolsConfig, 
  ToolDefinition, 
  ToolHandler, 
  ValidationResult, 
  DatabaseClient 
} from "./types"

// 数据库相关工具
export {
  initDB,
  mapFieldTypeToSQLType,
  generateFieldDefs,
  generateFieldInsertParams,
  getTableRecordCount,
  getAllTablesStructure
} from "./database"

// 验证相关工具
export {
  validateSQLSafety,
  validateFieldType,
  validateFieldConfig
} from "./validation"

// 数据处理工具
export {
  processValueByFieldType,
  processDefaultValues,
  prepareInsertParams,
  prepareUpdateParams
} from "./dataProcessor"

// 同步工具
export {
  syncToBackend,
  syncDataToLocal
} from "./sync"

// 工具处理器
export {
  createRecordHandler,
  createUpdateHandler,
  createQueryHandler,
  insertDefaultValues
} from "./toolHandlers" 