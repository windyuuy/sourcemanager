import { SMCmdOptions, TSMCmdOptions } from "../cmdline/SMCmdOptions";
import { ConfigFile, ConfigFolder, ConfigLoader } from "../config/ConfigLoader";
import { RunOptions } from "../config/RunOptions";
import { ConfigRunner } from "./ConfigRunner";
import * as fs from "fs";
import * as fse from "fse";
import { FailedRoute, SyncResult } from "./IRecordSync";

/**
 * 命令执行结果
 */
export class CmdResult {
	/**
	 * 记录执行结果
	 */
	recordResult: SyncResult[] = []

	/**
	 * 检查错误并抛出
	 */
	checkErrors() {
		this.recordResult.forEach(result => {
			if ((!result.skipped) && (!result.succeed)) {
				console.error(`- [sm2] run record failed: ${result.recordName}`)
				result.failedRoutes.forEach((failure, index) => {
					console.error(`- [sm2][${result.recordName}] failure[${index}]: ${failure.reason}`)
				})
			}
		})
		let allCount = this.recordResult.length
		let allFailed = this.recordResult.filter(result => !result.succeed).length
		let allSkip = this.recordResult.filter(result => result.skipped).length
		let allSucceed = this.recordResult.filter(result => (!result.skipped) && result.succeed).length
		console.log(`- [sm2] execute all done: all=${allCount}, succeed=${allSucceed}, skip=${allSkip}, failed=${allFailed}.`)
	}
}

/**
 * 执行命令
 */
export class CmdRunner {
	async run(cmdOptions: TSMCmdOptions) {
		let workDir = cmdOptions.workDir
		if (workDir) {
			let cwd = process.cwd()
			process.chdir(workDir)
			try {
				return this.runInWorkDir(cmdOptions)
			} catch (e) {
				console.error(e)
			} finally {
				process.chdir(cwd)
			}
		} else {
			return this.runInWorkDir(cmdOptions)
		}
	}

	/**
	 * 在工作目录下执行
	 * @param cmdOptions 
	 */
	runInWorkDir(cmdOptions: TSMCmdOptions): Promise<CmdResult> {
		if (cmdOptions.init) {
			return this.runInit(cmdOptions)
		} else {
			return this.runRecords(cmdOptions)
		}
	}

	/**
	 * 执行初始化命令
	 * @param cmdOptions 
	 */
	runInit(cmdOptions: TSMCmdOptions): Promise<CmdResult> {
		// 创建默认的配置
		fse.writeFileSync(".sm2/sm2.json", `{
    "$schema": "https://raw.githubusercontent.com/windyuuy/sourcemanager/main/design/sm2.schema.json",
    "buildList": []
}`)
		return new Promise<CmdResult>((resolve, reject) => {
			let result = new CmdResult()
			resolve(result)
		})
	}

	/**
	 * 执行相关记录
	 * @param cmdOptions 
	 */
	runRecords(cmdOptions: TSMCmdOptions): Promise<CmdResult> {
		let configFile = ConfigFile
		let workPath = process.cwd()
		let configPath = `${workPath}/${configFile}`
		if (cmdOptions.config) {
			configPath = `${cmdOptions.config}/${configFile}`
		}
		if (!fs.existsSync(configPath)) {
			configPath = `${workPath}/${ConfigFolder}/${configFile}`
		}
		let projectPath = cmdOptions.projectPath
		if (!projectPath) {
			projectPath = workPath
		}

		let configContent = fs.readFileSync(configPath, "utf8")
		let config = ConfigLoader.parseJsonFile(configContent)
		let configRunner = new ConfigRunner()

		let tasks: Promise<SyncResult>[] = []
		// 执行匹配的记录
		let runOptions = new RunOptions()
		runOptions.setRecordNames(cmdOptions.recordNames)
		runOptions.configPath = configPath
		runOptions.workPath = workPath
		runOptions.setRecordTags(cmdOptions.recordTags)
		let results = configRunner.run(config, runOptions)
		tasks.push(...results)

		// 逐条合并结果
		let result = new CmdResult()
		tasks.forEach(task => {
			task.then((ret) => {
				result.recordResult.push(ret)
			})
		})

		return new Promise<CmdResult>((resolve, reject) => {
			Promise.all(tasks).then(() => {
				resolve(result)
			}).catch(e => {
				reject(e)
			})
		})
	}
}
