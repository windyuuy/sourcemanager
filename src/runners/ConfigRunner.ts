import { BuildRecord, ConfigStruct } from "../config/ConfigLoader";
import { RunOptions } from "../config/RunOptions";
import { IRecordSync, RecordSyncBase, SyncResult } from "./IRecordSync";
import { RecordSyncFactory } from "./SyncFactory";

/**
 * 配置执行器
 */
export class ConfigRunner {
	run(config: ConfigStruct, runConfig: RunOptions): Promise<SyncResult> {
		let record = config.buildList.find(config => config.name == runConfig.recordName)
		let recordRunner = RecordSyncFactory.create(record.vcs);
		return recordRunner.execute(record, runConfig)
	}

	runRecord(record: BuildRecord, runConfig: RunOptions): Promise<SyncResult> {
		let recordRunner = RecordSyncFactory.create(record.vcs);
		return recordRunner.execute(record, runConfig)
	}
}
