import * as fs from 'fs-extra'
import * as path from 'path'
import inquirer from 'inquirer'
import chalk from 'chalk'

interface InitOptions {
  template: string
}

interface ProjectAnswers {
  name: string
  description: string
  author: string
  template: string
}

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
]

export async function init (
  options: InitOptions & { path?: string }
): Promise<void> {
  let targetDir: string
  let projectName: string

  if (options.path === '.') {
    // 如果指定了 "." 参数，直接在当前目录创建
    targetDir = process.cwd()
    projectName = path.basename(targetDir)
  } else {
    // 如果没有指定路径，先询问项目名称
    const { name } = await inquirer.prompt<{ name: string }>([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: path.basename(process.cwd())
      }
    ])
    projectName = name
    targetDir = path.join(process.cwd(), name)
    // 创建项目目录
    await fs.ensureDir(targetDir)
  }

  // 询问模板选择（如果没有通过命令行指定）
  let selectedTemplate = options.template
  if (!selectedTemplate || selectedTemplate === 'default') {
    const { template } = await inquirer.prompt<{ template: string }>([
      {
        type: 'list',
        name: 'template',
        message: 'Select a template:',
        choices: AVAILABLE_TEMPLATES,
        default: 'default'
      }
    ])
    selectedTemplate = template
  }

  // 继续询问其他信息
  const answers = await inquirer.prompt<ProjectAnswers>([
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
  ])

  answers.name = projectName // 使用之前确定的项目名称
  answers.template = selectedTemplate

  // 获取当前包的根目录
  const pkgPath = path.resolve(__dirname, '../../package.json')
  const pkgDir = path.dirname(pkgPath)
  const templateDir = path.join(pkgDir, 'dist/templates', selectedTemplate)

  console.log('Debug - Package directory:', pkgDir)
  console.log('Debug - Template directory:', templateDir)
  console.log('Debug - Selected template:', selectedTemplate)

  try {
    // 检查模板是否存在
    if (!(await fs.pathExists(templateDir))) {
      throw new Error(
        `Template "${selectedTemplate}" not found at ${templateDir}`
      )
    }

    // 复制模板文件
    await fs.copy(templateDir, targetDir, {
      filter: src => {
        const basename = path.basename(src)
        if (basename === '.gitignore') {
          return true // 显式包含 .gitignore 文件
        }
        return basename !== 'node_modules' && basename !== '.git'
      }
    })

    // 读取并更新 package.json
    const packageJsonPath = path.join(targetDir, 'package.json')
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath)
      const updatedPackageJson = {
        ...packageJson,
        name: answers.name,
        description: answers.description,
        author: answers.author
      }
      await fs.writeJson(packageJsonPath, updatedPackageJson, { spaces: 2 })
    }

    console.log(chalk.blue('\n📦 Installing dependencies...'))
    // 这里可以添加自动安装依赖的逻辑

    console.log(chalk.green('\n🎉 Project created successfully!'))
    console.log(chalk.yellow('\nNext steps:'))
    console.log(chalk.white('  1. cd', answers.name))
    console.log(chalk.white('  2. npm install'))
    console.log(chalk.white('  3. npm start'))
    
    // 根据模板类型显示不同的提示信息
    if (selectedTemplate === 'social-recommendation') {
      console.log(chalk.cyan('\n📋 Social Recommendation Template Features:'))
      console.log(chalk.white('  - Database integration with SQLite'))
      console.log(chalk.white('  - Social information collection'))
      console.log(chalk.white('  - Topic recommendation system'))
      console.log(chalk.white('  - Complete CRUD operations'))
      console.log(chalk.white('\n  Usage: npm run dev'))
    }
  } catch (error) {
    throw new Error(
      `Failed to initialize project: ${
        error instanceof Error ? error.message : String(error)
      }`
    )
  }
}
