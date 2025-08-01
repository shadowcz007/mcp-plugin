"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
// 可用的模板列表
const AVAILABLE_TEMPLATES = [
    {
        name: 'Default Template (基础模板)',
        value: 'default',
        description: '包含基础工具示例的简单模板'
    },
    {
        name: 'Social Recommendation (社交推荐系统)',
        value: 'social-recommendation',
        description: '包含数据库支持的社交推荐系统模板'
    }
];
async function init(options) {
    let targetDir;
    let projectName;
    if (options.path === '.') {
        // 如果指定了 "." 参数，直接在当前目录创建
        targetDir = process.cwd();
        projectName = path.basename(targetDir);
    }
    else {
        // 如果没有指定路径，先询问项目名称
        const { name } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Project name:',
                default: path.basename(process.cwd())
            }
        ]);
        projectName = name;
        targetDir = path.join(process.cwd(), name);
        // 创建项目目录
        await fs.ensureDir(targetDir);
    }
    // 询问模板选择（如果没有通过命令行指定）
    let selectedTemplate = options.template;
    if (!selectedTemplate || selectedTemplate === 'default') {
        const { template } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'template',
                message: 'Select a template:',
                choices: AVAILABLE_TEMPLATES,
                default: 'default'
            }
        ]);
        selectedTemplate = template;
    }
    // 继续询问其他信息
    const answers = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'description',
            message: 'Project description:'
        },
        {
            type: 'input',
            name: 'author',
            message: 'Author:'
        }
    ]);
    answers.name = projectName; // 使用之前确定的项目名称
    answers.template = selectedTemplate;
    // 获取当前包的根目录
    const pkgPath = path.resolve(__dirname, '../../package.json');
    const pkgDir = path.dirname(pkgPath);
    const templateDir = path.join(pkgDir, 'dist/templates', selectedTemplate);
    console.log('Debug - Package directory:', pkgDir);
    console.log('Debug - Template directory:', templateDir);
    console.log('Debug - Selected template:', selectedTemplate);
    try {
        // 检查模板是否存在
        if (!(await fs.pathExists(templateDir))) {
            throw new Error(`Template "${selectedTemplate}" not found at ${templateDir}`);
        }
        // 复制模板文件
        await fs.copy(templateDir, targetDir, {
            filter: src => {
                const basename = path.basename(src);
                if (basename === '.gitignore') {
                    return true; // 显式包含 .gitignore 文件
                }
                return basename !== 'node_modules' && basename !== '.git';
            }
        });
        // 读取并更新 package.json
        const packageJsonPath = path.join(targetDir, 'package.json');
        if (await fs.pathExists(packageJsonPath)) {
            const packageJson = await fs.readJson(packageJsonPath);
            const updatedPackageJson = {
                ...packageJson,
                name: answers.name,
                description: answers.description,
                author: answers.author
            };
            await fs.writeJson(packageJsonPath, updatedPackageJson, { spaces: 2 });
        }
        console.log(chalk_1.default.blue('\n📦 Installing dependencies...'));
        // 这里可以添加自动安装依赖的逻辑
        console.log(chalk_1.default.green('\n🎉 Project created successfully!'));
        console.log(chalk_1.default.yellow('\nNext steps:'));
        console.log(chalk_1.default.white('  1. cd', answers.name));
        console.log(chalk_1.default.white('  2. npm install'));
        console.log(chalk_1.default.white('  3. npm start'));
        // 根据模板类型显示不同的提示信息
        if (selectedTemplate === 'social-recommendation') {
            console.log(chalk_1.default.cyan('\n📋 Social Recommendation Template Features:'));
            console.log(chalk_1.default.white('  - Database integration with SQLite'));
            console.log(chalk_1.default.white('  - Social information collection'));
            console.log(chalk_1.default.white('  - Topic recommendation system'));
            console.log(chalk_1.default.white('  - Complete CRUD operations'));
            console.log(chalk_1.default.white('\n  Usage: npm run dev'));
        }
    }
    catch (error) {
        throw new Error(`Failed to initialize project: ${error instanceof Error ? error.message : String(error)}`);
    }
}
