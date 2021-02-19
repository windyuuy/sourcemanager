import { SMCmdOptions } from "../cmdline/SMCmdOptions"
import { CmdRunner } from "./CmdRunner"

/**
 * 执行指定命令
 * @param argv 
 */
export async function runCmd(argv: string[]) {
	SMCmdOptions.parse(argv)
	let cmdOptions = SMCmdOptions.options

	let runner = new CmdRunner()
	try {
		let results = await runner.run(cmdOptions)
		results.checkErrors()
	} catch (e) {
		console.error("- [sm2] 执行异常:", e)
	}
}

/**
 * 执行指定命令
 * @param argv 
 */
export async function runCustomCmd(argv: string[]) {
	await runCmd(argv)
}
