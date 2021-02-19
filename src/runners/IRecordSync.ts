import { BuildRecord, ConfigStruct, CopyRoute } from "../config/ConfigLoader";
import { RunOptions } from "../config/RunOptions";

/**
 * 失败的路由
 */
export class FailedRoute {
	/**
	 * 执行路由
	 */
	route: CopyRoute
	/**
	 * 失败原因
	 */
	reason: string
	/**
	 * 失败原因
	 */
	error: Error
}

/**
 * 同步结果
 */
export class SyncResult {
	/**
	 * 执行记录名
	 */
	recordName: string

	/**
	 * 跳过执行
	 */
	skipped: boolean = false

	/**
	 * 失败项列表
	 */
	failedRoutes: FailedRoute[] = []

	/**
	 * 是否执行成功
	 */
	succeed: boolean = false

	/**
	 * 扩展添加结果
	 * @param ret 
	 */
	add(ret: SyncResult) {
		this.failedRoutes.push(...ret.failedRoutes)
	}

}

/**
 * 克隆结果
 */
export class CloneSyncResult extends SyncResult {

}

/**
 * 同步接口
 */
export interface IRecordSync {
	init(config: ConfigStruct): this
	/**
	 * 执行同步阶段
	 * @param record 
	 * @param stage 
	 */
	execute(record: BuildRecord, runConfig: RunOptions): Promise<SyncResult>
}

/**
 * 同步基类
 */
export abstract class RecordSyncBase implements IRecordSync {
	init() {
		return this
	}

	abstract execute(record: BuildRecord, runConfig: RunOptions): Promise<SyncResult>

}
