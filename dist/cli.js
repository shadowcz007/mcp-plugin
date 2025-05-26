#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const chalk_1 = __importDefault(require("chalk"));
const program = new commander_1.Command();
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
    console.log(chalk_1.default.blue('🚀 Starting project initialization...'));
    try {
        await (0, init_1.init)(options);
        console.log(chalk_1.default.green('✨ Project initialized successfully!'));
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
});
program.parse();
