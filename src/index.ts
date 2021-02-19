
import { runCmd } from "./runners/RunCmd"

/**
 * 执行默认命令
 */
export async function runDefaultCmd() {
	await runCmd(process.argv)
}

runDefaultCmd()
