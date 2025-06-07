#!/usr/bin/env node
import { Command } from 'commander';
import { init } from './commands/init';
import chalk from 'chalk';
import { create } from './commands/create';

const program = new Command();

// 设置版本号和描述
program
  .name('mcp-plugin')
  .description('MCP Plugin CLI tool for project initialization')
  .version('1.0.0');

// 添加 init 命令
program
  .command('init [path]')
  .description('Initialize a new MCP project. Use "." to create in current directory')
  .option('-t, --template <template>', 'Template to use', 'default')
  .action(async (path, options) => {
    console.log(chalk.blue('🚀 Starting project initialization...'));
    try {
      await init({ ...options, path });
      console.log(chalk.green('✨ Project initialized successfully!'));
    } catch (error) {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.command('create')
  .description('Create a new MCP plugin')
  .action(async () => {
    console.log(chalk.blue('🚀 Starting plugin creation...'));
    await create();
  });

program.parse(); 