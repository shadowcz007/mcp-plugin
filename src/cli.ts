#!/usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init';
import chalk from 'chalk';

const program = new Command();

// 设置版本号和描述
program
  .name('mcp-plugin')
  .description('MCP Plugin CLI tool for project initialization')
  .version('1.0.0');

// 添加 init 命令
program
  .command('init')
  .description('Initialize a new MCP project')
  .option('-t, --template <template>', 'Template to use', 'default')
  .action(async (options) => {
    console.log(chalk.blue('🚀 Starting project initialization...'));
    try {
      await init(options);
      console.log(chalk.green('✨ Project initialized successfully!'));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse(); 