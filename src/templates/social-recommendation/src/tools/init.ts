import path from 'path'

// 通用命令行参数获取函数
function getArgFromArgs (
  longName: string,
  shortName: string,
  defaultValue: string,
  warnMsg: string
): string {
  const args = process.argv.slice(2)
  for (let i = 0; i < args.length; i++) {
    if (args[i] === longName || args[i] === shortName) {
      const value = args[i + 1]
      if (!value) {
        console.warn(`警告: ${warnMsg}，使用默认:`, defaultValue)
        return defaultValue
      }
      return value
    }
  }
  console.warn(`警告: 未指定${warnMsg}，使用默认:`, defaultValue)
  return defaultValue
}

declare global {
  var databasePath: string
  var userId: string
  var userName: string
  var deviceId: string
}
// 获取参数
globalThis.databasePath = getArgFromArgs(
  '--database-path',
  '-d',
  path.join(process.cwd(), 'ThePersonalAnnalist.sqlite'),
  '数据库路径参数未提供'
)
globalThis.userId = getArgFromArgs(
  '--user-id',
  '-u',
  'unknow',
  '用户ID参数未提供'
)
globalThis.deviceId = getArgFromArgs(
  '--device-id',
  '-i',
  'unknow',
  '设备ID参数未提供'
)
console.log('🔧 [CONFIG] databasePath:', globalThis.databasePath)
console.log('🔧 [CONFIG] userId:', globalThis.userId)
console.log('🔧 [CONFIG] deviceId:', globalThis.deviceId)
