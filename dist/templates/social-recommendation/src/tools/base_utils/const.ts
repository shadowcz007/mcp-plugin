const TOOLS_PREFIX = {
  QUERY: 'query',
  UPDATE: 'update',
  RECORD: 'record'
}

//数据库基础字段：user_id , device_id , create_time , update_time,
const BASE_FIELDS_CONFIG = [
  {
    name: 'user_id',
    type: 'string',
    isOptional: false,
    description: '用户ID',
    defaultValue: globalThis.userId
  },
  {
    name: 'device_id',
    type: 'string',
    isOptional: false,
    description: '设备ID',
    defaultValue: globalThis.deviceId
  },
  {
    name: 'create_time',
    type: 'datetime',
    isOptional: false,
    description: '创建时间'
  },
  {
    name: 'update_time',
    type: 'datetime',
    isOptional: false,
    description: '更新时间'
  }
]

export {
  TOOLS_PREFIX, BASE_FIELDS_CONFIG
} 