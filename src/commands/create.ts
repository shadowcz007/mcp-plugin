import { exec } from 'child_process';
import { resolve } from 'path';
import chalk from 'chalk';
import open from 'open';
import express from 'express';

interface CreateOptions {
  port?: number;
}

export async function create(options: CreateOptions = {}) {
  const port = options.port || 3366;
  const app = express();
  
  // 获取index.html的绝对路径
  const indexPath = resolve(__dirname, '../..', 'index.html');
  
  // 设置静态文件服务
  app.use(express.static(resolve(__dirname, '../..')));
  
  // 启动服务器
  const server = app.listen(port, () => {
    console.log(chalk.blue(`🚀 工具生成器已启动！`));
    console.log(chalk.green(`✨ 访问地址: http://localhost:${port}`));
    
    // 自动打开浏览器
    open(`http://localhost:${port}`);
  });
  
  // 处理进程退出
  process.on('SIGINT', () => {
    server.close(() => {
      console.log(chalk.yellow('\n👋 工具生成器已关闭'));
      process.exit(0);
    });
  });
} 