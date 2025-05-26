import * as fs from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

interface InitOptions {
  template: string;
}

interface ProjectAnswers {
  name: string;
  description: string;
  author: string;
}

export async function init(options: InitOptions & { path?: string }): Promise<void> {
  let targetDir: string;
  let projectName: string;

  if (options.path === '.') {
    // 如果指定了 "." 参数，直接在当前目录创建
    targetDir = process.cwd();
    projectName = path.basename(targetDir);
  } else {
    // 如果没有指定路径，先询问项目名称
    const { name } = await inquirer.prompt<{ name: string }>([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: path.basename(process.cwd()),
      }
    ]);
    projectName = name;
    targetDir = path.join(process.cwd(), name);
    // 创建项目目录
    await fs.ensureDir(targetDir);
  }

  // 继续询问其他信息
  const answers = await inquirer.prompt<ProjectAnswers>([
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author:',
    },
  ]);

  answers.name = projectName; // 使用之前确定的项目名称

  // 获取当前包的根目录
  const pkgPath = path.resolve(__dirname, '../../package.json');
  const pkgDir = path.dirname(pkgPath);
  const templateDir = path.join(pkgDir, 'dist/templates', options.template);
  
  console.log('Debug - Package directory:', pkgDir);
  console.log('Debug - Template directory:', templateDir);
  
  try {
    // 检查模板是否存在
    if (!await fs.pathExists(templateDir)) {
      throw new Error(`Template "${options.template}" not found at ${templateDir}`);
    }

    // 复制模板文件
    await fs.copy(templateDir, targetDir, {
      filter: (src) => {
        const basename = path.basename(src);
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
        author: answers.author,
      };
      await fs.writeJson(packageJsonPath, updatedPackageJson, { spaces: 2 });
    }

    console.log(chalk.blue('\n📦 Installing dependencies...'));
    // 这里可以添加自动安装依赖的逻辑
    
    console.log(chalk.green('\n🎉 Project created successfully!'));
    console.log(chalk.yellow('\nNext steps:'));
    console.log(chalk.white('  1. cd', answers.name));
    console.log(chalk.white('  2. npm install'));
    console.log(chalk.white('  3. npm start'));
  } catch (error) {
    throw new Error(`Failed to initialize project: ${error instanceof Error ? error.message : String(error)}`);
  }
} 