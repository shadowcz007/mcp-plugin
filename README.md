# MCP Plugin

这是一个 MCP 插件项目，提供了一些示例工具。用于[mcp_server_exe](https://github.com/shadowcz007/mcp_server_exe)的 --mcp-js 使用。

## 功能

该插件提供以下工具：

- `test-echo`: 回显输入的消息
- `get-current-time`: 获取当前时间
- `math-add`: 计算两个数字的和

## 安装

```bash
npm install mcp-plugin
```

## 开发

1. 安装依赖：
```bash
npm install
```

2. 构建项目：
```bash
npm run build
```

3. 运行测试：
```bash
npm test
```

## 使用方法

build 后，

```bash
mcp_server-win-x64.exe --mcp-js ./dist/index.js
```
