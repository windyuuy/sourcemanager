
/**
 * 配置目录
 */
export const ConfigFolder = ".sm2"

/**
 * 配置文件
 */
export const ConfigFile = "sm2.json"

/**
 * 预定义支持的版本控制类型
 */
export type VcsType = "unknown" | "folder" | "svn" | "git" | "ccf" | "oss"

/**
 * 版本控制阶段
 */
export type VscStage = "clone" | "update"

/**
 * 通过命令行形式覆盖构建阶段
 */
export class BuildStageOverride {
	loadFrom(json: BuildStageOverride) {
		this.stage = json.stage
		return this
	}
	/**
	 * 构建阶段
	 * - clone: 新克隆副本
	 * - update: 更新已有副本
	 */
	stage: VscStage
}

/**
 * 文件复制路由
 */
export class CopyRoute {
	/**
	 * 待发布文件
	 */
	fromFile?: string
	/**
	 * 上传目录
	 */
	fromFolder?: string
	/**
	 * 上传文件目标
	 */
	toFile?: string
	/**
	 * 上传目录目标
	 */
	toFolder?: string

	loadFrom(json: DistCloneRoute): any {
		this.fromFile = json.fromFile
		this.fromFolder = json.fromFolder
		this.toFile = json.toFile
		this.toFolder = json.toFolder
		return this
	}
}

/**
 * 发布文件的克隆路由列表
 */
export class DistCloneRoute extends CopyRoute {
}

/**
 * 发布文件上传路由列表
 */
export class DistUploadRoute extends CopyRoute {
}

/**
 * 一行构建记录
 */
export class BuildRecord {
	/**
	 * 标志记录名
	 * - 如果出现重名, 按照广度优先遍历
	 */
	name: string = ""

	/**
	 * 标签列表
	 */
	tags: string[] = []

	static _idAcc = 1
	/**
	 * 运行时记录ID, 应对重名问题
	 */
	id: number = BuildRecord._idAcc++

	/**
	 * 是否启用
	 */
	enable: boolean = true

	/**
	 * 构建类型
	 * - pre: 预定义的
	 * - cmd: 纯命令行
	 */
	type: "pre" | "cmd" = "pre"

	/**
	 * 预定义支持的版本控制系统
	 * - folder: 本地路径
	 * - svn
	 * - git
	 * - ccf
	 */
	vcs: VcsType = "folder"

	/**
	 * 自定义构建阶段
	 */
	stages: BuildStageOverride[] = []

	/**
	 * 源链接
	 */
	sourceUrl: string = null

	/**
	 * 账号
	 */
	account: string
	/**
	 * 密码
	 */
	password: string

	/**
	 * 克隆路由
	 * - 支持列表
	 * 	- folder 多个
	 * 	- svn 多个
	 * 	- ccf 单个
	 * 	- git 单个
	 */
	cloneRoutes: DistCloneRoute[] = []

	/**
	 * 上传路由
	 * - 支持列表:
	 * 	- folder 多个
	 * 	- svn 多个
	 * 	- ccf 单个
	 * 	- git 单个
	 */
	uploadRoutes: DistUploadRoute[] = []

	/**
	 * 执行的命令
	 */
	cmd: string

	loadFrom(json: BuildRecord) {
		this.name = json.name
		this.enable = json.enable ?? this.enable
		this.type = json.type ?? this.type
		this.vcs = json.vcs ?? this.vcs
		this.stages = (json.stages ?? []).map(json => {
			return new BuildStageOverride().loadFrom(json)
		})
		this.sourceUrl = json.sourceUrl ?? this.sourceUrl
		this.cloneRoutes = (json.cloneRoutes ?? []).map(json => {
			return new DistCloneRoute().loadFrom(json)
		})
		this.uploadRoutes = (json.uploadRoutes ?? []).map(json => {
			return new DistUploadRoute().loadFrom(json)
		})
		if (json.tags) {
			this.tags = json.tags.concat()
		}
		this.cmd = json.cmd
		return this
	}
}

/**
 * 定义配置文件结构
 * - 默认支持检测 .sm2文件 和 .sm2/.sm2文件
 * - 工作目录默认位于 .sm2文件同级目录 和 .sm2/.sm2文件父级目录
 */
export class ConfigStruct {
	/**
	 * 构建列表
	 */
	buildList: BuildRecord[] = []

	loadFrom(json: ConfigStruct) {
		this.buildList.length = 0
		if (json.buildList) {
			json.buildList.forEach((json) => {
				let info = new BuildRecord()
				info.loadFrom(json)
				this.buildList.push(info)
			})
		}
	}
}

/**
 * 配置加载工具类
 */
export class TConfigLoader {
	parseJsonFile(text: string): ConfigStruct {
		return JSON.parse(text) as ConfigStruct
	}
}

export const ConfigLoader = new TConfigLoader()
