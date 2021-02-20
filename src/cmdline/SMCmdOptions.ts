import { VscStage } from "../config/ConfigLoader";
import { CmdOptions } from "./CmdOptions";

/**
 * 本项目命令行选项
 */
export class TSMCmdOptions {
	/**
	 * 版本号
	 */
	version: string;
	/**
	 * 指定记录名列表
	 */
	recordNames?: string;
	/**
	 * 配置文件
	 */
	config?: string;
	/**
	 * 指定工作路径
	 */
	workDir?: string;
	/**
	 * 指定记录列表
	 */
	recordTags?: string;
	/**
	 * 项目路径
	 */
	projectPath: string;
	/**
	 * 初始化配置
	 */
	init: boolean;
}

export const SMCmdOptions = new CmdOptions<TSMCmdOptions>()
