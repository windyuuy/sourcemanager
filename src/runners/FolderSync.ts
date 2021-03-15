import { BuildRecord } from "../config/ConfigLoader";
import { CloneSyncResult, FailedRoute, RecordSyncBase, SyncResult } from "./IRecordSync";
import * as glob from "glob"
import * as fs from "fs"
import * as fse from "fse"
import * as path from "path"
import { RunOptions } from "../config/RunOptions";

export class FolderSync extends RecordSyncBase {

	/**
	 * 执行备份
	 */
	makeBackUp() {

	}

	/**
	 * 从备份恢复
	 */
	doRecorver() {

	}

	/**
	 * 
	 * @param record 下载源文件
	 * @param runConfig 
	 */
	cloneSource(record: BuildRecord, runConfig: RunOptions): Promise<CloneSyncResult> {
		let routes = record.cloneRoutes
		if (routes == null || routes.length == 0) {
			return new Promise<CloneSyncResult>((resolve, reject) => {
				let result = new CloneSyncResult()
				result.skipped = true
				result.succeed = true
				resolve(result)
			})
		}

		let recordWorkDir = runConfig.getRecordWorkDir()
		let sourceUrl = record.sourceUrl
		let result = new CloneSyncResult()
		result.recordName = record.name
		return new Promise<CloneSyncResult>((resolve, reject) => {
			// 先备份
			this.makeBackUp()

			Promise.all(routes.map(route => {
				return new Promise<void>((resolve, reject) => {
					(function () {
						let files: string[] = []
						let fromFolder: string
						// 扫描源目录
						if (route.fromFolder) {
							let fromPath = `${sourceUrl}/${route.fromFolder}`
							fromFolder = route.fromFolder
							if (fs.existsSync(fromPath)) {
								// 扫描源路径
								let folderFiles = glob.sync(fromPath + "/**/*", { absolute: false })
								let rfiles = folderFiles.map(f => {
									let f2 = path.relative(fromPath, f)
									return f2
								})
								files.push(...rfiles)
							} else {
								let failed = new FailedRoute()
								failed.reason = `invalid fromFolder <${fromPath}>`
								failed.route = route
								result.failedRoutes.push(failed)
								return
							}
						}
						// 扫描源文件
						else if (route.fromFile) {
							let fromFile = `${sourceUrl}/${route.fromFile}`
							fromFolder = path.dirname(route.fromFile)
							if (fs.existsSync(fromFile)) {
								files.push(`${route.fromFile}`)
							} else {
								let failed = new FailedRoute()
								failed.reason = `invalid fromFile <${fromFile}>`
								failed.route = route
								result.failedRoutes.push(failed)
								return
							}
						} else {
							// 没有有效输入
							let failed = new FailedRoute()
							failed.reason = `invalid input`
							failed.route = route
							result.failedRoutes.push(failed)
							return
						}

						if (route.toFolder) {
							// 目标目录
							let toFolder = `${recordWorkDir}/${route.toFolder}`
							files.forEach(file => {
								try {
									// 导出目录总是相对实际工作目录
									fse.copyFileSync(`${sourceUrl}/${fromFolder}/${file}`, `${toFolder}/${file}`)
								} catch (e) {
									let failed = new FailedRoute()
									failed.error = e
									failed.route = route
									failed.reason = `copy file failed.`
									result.failedRoutes.push(failed)
								}
							})
						} else if (route.toFile) {
							if (files.length == 0) {
								// 无效的输入文件
								let failed = new FailedRoute()
								failed.route = route
								failed.reason = `invalid input file.`
								result.failedRoutes.push(failed)
							} else {
								try {
									// 导出目录总是相对实际工作目录
									fse.copyFileSync(`${sourceUrl}/${files[0]}`, `${route.toFile}`)
								} catch (e) {
									let failed = new FailedRoute()
									failed.error = e
									failed.route = route
									failed.reason = `copy file failed.`
									result.failedRoutes.push(failed)
								}
							}
						} else {
							// 没有有效输出
							let failed = new FailedRoute()
							failed.reason = `invalid output`
							failed.route = route
							result.failedRoutes.push(failed)
						}
					})()

					resolve()
				})
			})).then(() => {
				// 判定成功失败
				result.succeed = result.failedRoutes.length == 0

				// 失败则恢复
				if (!result.succeed) {
					this.doRecorver()
				}

				resolve(result)
			})
		})
	}

	execute(record: BuildRecord, runConfig: RunOptions): Promise<SyncResult> {
		let cmd = record.cmd

		let result: Promise<SyncResult>
		switch (cmd) {
			case "cloneSource": {
				result = this.cloneSource(record, runConfig)
				break
			}
			default: {
				throw new Error(`unsupported build stage <${cmd}>`)
			}
		}
		return result
	}

}
