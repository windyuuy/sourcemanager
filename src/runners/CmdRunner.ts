import { SMCmdOptions, TSMCmdOptions } from "../cmdline/SMCmdOptions";
import { ConfigFile, ConfigFolder, ConfigLoader } from "../config/ConfigLoader";
import { RunOptions } from "../config/RunOptions";
import { ConfigRunner } from "./ConfigRunner";
import * as fs from "fs";
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
	runInWorkDir(cmdOptions: TSMCmdOptions) {
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
		if (cmdOptions.record) {
			// 执行单条记录
			let runOptions = new RunOptions()
			runOptions.recordName = cmdOptions.record
			runOptions.configPath = configPath
			runOptions.workPath = workPath
			runOptions.stage = cmdOptions.stage
			let result = configRunner.run(config, runOptions)
			tasks.push(result)
		} else {
			// 如果执行多个记录, 那么只保证单个记录的执行完整性
			let results = config.buildList.map(record => {
				let runOptions = new RunOptions()
				runOptions.recordName = record.name
				runOptions.configPath = configPath
				runOptions.workPath = workPath
				runOptions.stage = cmdOptions.stage
				let result = configRunner.runRecord(record, runOptions)
				return result
			})
			tasks.push(...results)
		}

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
