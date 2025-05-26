# MCP Plugin

这是一个 MCP 插件项目，提供了用于快速创建 MCP 工具的脚手架。可以用于 [mcp_server_exe](https://github.com/shadowcz007/mcp_server_exe) 的插件开发。

This is an MCP plugin project that provides a scaffold for quickly creating MCP tools. It can be used for plugin development with [mcp_server_exe](https://github.com/shadowcz007/mcp_server_exe).

## 功能 | Features

中文 | English
---|---
提供命令行工具，快速创建 MCP 插件项目 | Command-line tool for rapid MCP plugin project creation
内置默认模板，包含基础工具示例 | Built-in default templates with basic tool examples
支持 TypeScript 开发环境 | TypeScript development environment support
集成测试框架（Jest） | Integrated testing framework (Jest)

## 安装 | Installation

### 全局安装（推荐）| Global Installation (Recommended)

```bash
npm install -g mcp-plugin
```

### 本地安装 | Local Installation

```bash
npm install mcp-plugin
```

## 使用方法 | Usage

### 创建新项目 | Create New Project

```bash
# 创建新项目 | Create new project
mcp-plugin init

# 使用指定模板创建项目 | Create project with specific template
mcp-plugin init -t template-name
```

创建项目过程中会提示输入：| During project creation, you'll be prompted for:

中文 | English
---|---
项目名称 | Project name
项目描述 | Project description
作者信息 | Author information

### 项目开发 | Project Development

中文 | English
---|---
1. 进入项目目录：| 1. Enter project directory:
```bash
cd your-project-name
```

2. 安装依赖：| 2. Install dependencies:
```bash
npm install
```

3. 开发模式：| 3. Development mode:
```bash
npm run dev
```

4. 构建项目：| 4. Build project:
```bash
npm run build
```

5. 运行测试：| 5. Run tests:
```bash
npm test
```

### 与 MCP Server 集成 | Integration with MCP Server

中文：构建完成后，可以通过以下方式启动 MCP Server 并加载你的插件：

English: After building, you can start the MCP Server and load your plugin using:

```bash
mcp_server-win-x64.exe --mcp-js ./dist/index.js
```

## 默认模板工具示例 | Default Template Tool Examples

### 1. test-echo

中文 | English
---|---
功能：回显输入的消息 | Function: Echo back input message
参数：message (string) | Parameters: message (string)

### 2. get-current-time

中文 | English
---|---
功能：获取当前时间 | Function: Get current time
参数：无 | Parameters: none

### 3. math-add

中文 | English
---|---
功能：计算两个数字的和 | Function: Add two numbers
参数：| Parameters:
- a (number)：第一个数字 | - a (number): First number
- b (number)：第二个数字 | - b (number): Second number

## 自定义开发 | Custom Development

你可以在 `src` 目录下修改或添加新的工具。每个工具需要实现：

You can modify or add new tools in the `src` directory. Each tool needs to implement:

中文 | English
---|---
工具名称 | Tool name
工具描述 | Tool description
参数 schema（使用 zod 定义）| Parameter schema (defined using zod)
处理函数 | Handler function

示例 | Example:
```typescript
server.tool(
  'tool-name',           // 工具名称 | Tool name
  'Tool description',    // 工具描述 | Tool description
  {
    param: z.string()    // 参数定义 | Parameter definition
  },
  async (args) => {      // 处理函数 | Handler function
    // 实现逻辑 | Implementation logic
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

## 许可证 | License

Apache
