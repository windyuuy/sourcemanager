import { BuildRecord, ConfigStruct } from "../config/ConfigLoader";
import { RunOptions } from "../config/RunOptions";
import { IRecordSync, RecordSyncBase, SyncResult } from "./IRecordSync";
import { RecordSyncFactory } from "./SyncFactory";

/**
 * 配置执行器
 */
export class ConfigRunner {
	run(config: ConfigStruct, runConfig: RunOptions): Promise<SyncResult>[] {
		let records = config.buildList.filter(config => {
			let matchedName = config.name in runConfig.recordNames
			let matchedTag = false
			config.tags.forEach(tag => {
				if (tag in runConfig.recordTags) {
					matchedTag = true
				}
			})
			let matched = matchedTag && matchedName
			return matched
		})
		let results = records.map(record => {
			return this.runRecord(record, runConfig)
		})
		return results
	}

	runRecord(record: BuildRecord, runConfig: RunOptions): Promise<SyncResult> {
		let recordRunner = RecordSyncFactory.create(record.vcs);
		return recordRunner.execute(record, runConfig)
	}
}
