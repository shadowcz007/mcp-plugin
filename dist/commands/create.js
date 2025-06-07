"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const path_1 = require("path");
const chalk_1 = __importDefault(require("chalk"));
const open_1 = __importDefault(require("open"));
const express_1 = __importDefault(require("express"));
async function create(options = {}) {
    const port = options.port || 3366;
    const app = (0, express_1.default)();
    console.log((0, path_1.resolve)(__filename, '../../'));
    // 设置静态文件服务
    app.use(express_1.default.static((0, path_1.resolve)(__filename, '../../')));
    // 启动服务器
    const server = app.listen(port, () => {
        console.log(chalk_1.default.blue(`🚀 工具生成器已启动！`));
        console.log(chalk_1.default.green(`✨ 访问地址: http://localhost:${port}`));
        // 自动打开浏览器
        (0, open_1.default)(`http://localhost:${port}`);
    });
    // 处理进程退出
    process.on('SIGINT', () => {
        server.close(() => {
            console.log(chalk_1.default.yellow('\n👋 工具生成器已关闭'));
            process.exit(0);
        });
    });
}
