# MCP Plugin

这是一个 MCP 插件项目，提供了用于快速创建 MCP 工具的脚手架。可以用于 [mcp_server_exe](https://github.com/shadowcz007/mcp_server_exe) 的插件开发。

## 功能

- 提供命令行工具，快速创建 MCP 插件项目
- 内置默认模板，包含基础工具示例
- 支持 TypeScript 开发环境
- 集成测试框架（Jest）

## 安装

### 全局安装（推荐）

```bash
npm install -g mcp-plugin
```

### 本地安装

```bash
npm install mcp-plugin
```

## 使用方法

### 创建新项目

```bash
# 创建新项目
mcp-plugin init

# 使用指定模板创建项目
mcp-plugin init -t template-name
```

创建项目过程中会提示输入：
- 项目名称
- 项目描述
- 作者信息

### 项目开发

1. 进入项目目录：
```bash
cd your-project-name
```

2. 安装依赖：
```bash
npm install
```

3. 开发模式：
```bash
npm run dev
```

4. 构建项目：
```bash
npm run build
```

5. 运行测试：
```bash
npm test
```

### 与 MCP Server 集成

构建完成后，可以通过以下方式启动 MCP Server 并加载你的插件：

```bash
mcp_server-win-x64.exe --mcp-js ./dist/index.js
```

## 默认模板工具示例

默认模板包含以下示例工具：

1. `test-echo`
   - 功能：回显输入的消息
   - 参数：message (string)

2. `get-current-time`
   - 功能：获取当前时间
   - 参数：无

3. `math-add`
   - 功能：计算两个数字的和
   - 参数：
     - a (number)：第一个数字
     - b (number)：第二个数字

## 自定义开发

你可以在 `src` 目录下修改或添加新的工具。每个工具需要实现：
- 工具名称
- 工具描述
- 参数 schema（使用 zod 定义）
- 处理函数

示例：
```typescript
server.tool(
  'tool-name',           // 工具名称
  'Tool description',    // 工具描述
  {
    param: z.string()    // 参数定义
  },
  async (args) => {      // 处理函数
    // 实现逻辑
    return {
      content: [
        {
          type: 'text',
          text: 'result'
        }
      ]
    }
  }
)
```

## 许可证

Apache
