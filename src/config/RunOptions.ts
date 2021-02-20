import { ConfigFolder, VscStage } from "./ConfigLoader"
import * as path from "path"

/**
 * 执行配置
 */
export class RunOptions {
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
	recordNames: string[] = []
	/**
	 * 设置记录名列表
	 * @param names 
	 */
	setRecordNames(names: string) {
		this.recordNames = names.split(",")
	}
	/**
	 * 执行器工作路径
	 */
	workPath: string
	/**
	 * 标签列表
	 */
	recordTags: string[] = []
	/**
	 * 设置标签列表
	 * @param tags 
	 */
	setRecordTags(tags: string) {
		this.recordTags = tags.split(",")
	}

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
