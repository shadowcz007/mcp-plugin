# Social Recommendation MCP Plugin

这是一个基于数据库的社交推荐系统 MCP 插件模板，提供了完整的社交信息收集和话题推荐功能。

This is a database-based social recommendation system MCP plugin template that provides complete social information collection and topic recommendation functionality.

## Features | 功能特性

- **Database Integration** | 数据库集成
  - SQLite database support | SQLite 数据库支持
  - Automatic table creation | 自动表创建
  - CRUD operations | 完整的增删改查操作

- **Social Information Collection** | 社交信息收集
  - User profile management | 用户档案管理
  - Company information tracking | 公司信息跟踪
  - Social preferences recording | 社交偏好记录

- **Topic Recommendation** | 话题推荐
  - Context-aware topic suggestions | 基于上下文的话题建议
  - Conversation starters | 对话开场白
  - Social interaction enhancement | 社交互动增强

- **Advanced Features** | 高级功能
  - TypeScript support | TypeScript 支持
  - Zod data validation | Zod 数据验证
  - Complete development toolchain | 完整的开发工具链
  - Jest testing framework | Jest 测试框架

## Quick Start | 快速开始

1. **Install dependencies** | 安装依赖:
```bash
npm install
```

2. **Run in development mode** | 开发模式运行:
```bash
npm run dev
```

3. **Build project** | 构建项目:
```bash
npm run build
```

4. **Run tests** | 运行测试:
```bash
npm test
```

## Project Structure | 项目结构

```
.
├── src/
│   ├── index.ts                 # Main entry point
│   ├── data.ts                  # Data constants
│   ├── tools/
│   │   ├── index.ts            # Tools registration
│   │   ├── base.ts             # Tool creation utilities
│   │   ├── base_utils/         # Core utilities
│   │   │   ├── index.ts        # Utility exports
│   │   │   ├── database.ts     # Database operations
│   │   │   ├── types.ts        # Type definitions
│   │   │   ├── validation.ts   # Data validation
│   │   │   └── toolHandlers.ts # Tool handlers
│   │   └── config/             # Tool configurations
│   │       ├── index.ts        # Config exports
│   │       ├── social_info_collector.json
│   │       └── social_topic.json
│   └── utils/                  # Utility functions
├── db/                         # Database files
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

## Configuration | 配置说明

### Database Configuration | 数据库配置
- Database path can be specified via `--database-path` or `-d` argument
- Default database: `joy.sqlite` in project root

### User Configuration | 用户配置
- User ID: `--user-id` or `-u` argument
- User name: `--user-name` or `-n` argument
- Server API: `--server-api` or `-a` argument

## Available Tools | 可用工具

### 1. Social Information Collector | 社交信息收集器
- **Purpose**: Collect and manage user social information
- **Features**: User profiles, company info, social preferences
- **Operations**: Query, Record, Update

### 2. Social Topic Recommender | 社交话题推荐器
- **Purpose**: Recommend conversation topics based on context
- **Features**: Context-aware suggestions, conversation starters
- **Operations**: Query

## Usage Examples | 使用示例

### Starting the MCP Server
```bash
mcp_server-win-x64.exe --mcp-js ./dist/index.js --database-path ./db/social.sqlite --user-id user123 --user-name "John Doe"
```

### Database Operations
The plugin automatically creates necessary tables and provides:
- User profile management
- Social interaction tracking
- Topic recommendation system

## License | 许可证

MIT 