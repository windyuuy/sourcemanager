import { ConfigFolder, VscStage } from "./ConfigLoader"
import * as path from "path"

/**
 * 执行配置
 */
export class RunOptions {
	/**
	 * 要执行的阶段
	 */
	stage: VscStage
	/**
	 * 项目路径
	 */
	projectPath: string
	/**
	 * 配置路径
	 */
	configPath: string
	/**
	 * 记录名
	 */
	recordName: string
	/**
	 * 执行器工作路径
	 */
	workPath: string

	/**
	 * 记录工作路径
	 */
	getRecordWorkDir() {
		let configDir = path.dirname(this.configPath)
		if (configDir.endsWith(ConfigFolder)) {
			configDir = path.dirname(configDir)
		}
		return `${configDir}`
	}
}
