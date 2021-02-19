import { VcsType } from "../config/ConfigLoader";
import { FolderSync } from "./FolderSync";
import { IRecordSync } from "./IRecordSync";

/**
 * 执行器工厂
 */
export class TRecordSyncFactory {

	/**
	 * 创建执行器
	 * @param vcsType 
	 */
	create(vcsType: VcsType): IRecordSync {
		let runner: IRecordSync
		switch (vcsType) {
			case "folder": {
				runner = new FolderSync().init()
				break
			}
			default: {
				throw new Error(`svc type <${vcsType}> not supported`)
			}
		}
		return runner
	}
}

export const RecordSyncFactory = new TRecordSyncFactory()
