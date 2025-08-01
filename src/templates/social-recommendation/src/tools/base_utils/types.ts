/**
 * 类型定义
 */

export interface FieldConfig {
  name: string
  type: 'string' | 'number' | 'boolean' | 'datetime' | 'array'
  isOptional?: boolean
  description?: string
  defaultValue?: any
}

export interface ToolConfig {
  active: boolean
  syncToBackend?: boolean
  limit?: number
  excludeFields?: any
  updateByFields?: any
}

export interface ToolsConfig {
  record?: ToolConfig
  update?: ToolConfig
  query?: ToolConfig
}

export interface ToolDefinition {
  name: string
  description: string
  fields: FieldConfig[]
  tools?: ToolsConfig
  defaultValues?: Record<string, any>
}

export interface ToolHandler {
  name: string
  description: string
  fields: FieldConfig[]
  handler: (args: any, client: any, sendNotification: any) => Promise<any>
}

export interface ValidationResult {
  isValid: boolean
  errorMessage?: string
}

export interface DatabaseClient {
  createDatabase: (path: string) => any
} 