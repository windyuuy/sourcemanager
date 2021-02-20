
import { program } from "commander"

/**
 * 命令行选项解析
 */
export class CmdOptions<T> {
	version: string;
	parse(argv: string[]) {
		console.log("- [sm2] parse argv:", argv)
		program.version(this.version);
		program
			.option('-w, --work-dir <type>', 'work dir')
			.option('-c, --config <type>', 'input config file')
			.option('-t, --record-tags <type>', 'execute tags')
			.option('-r, --record-names <type>', 'execute records')
			.option('-p, --project-path <type>', 'project path')
			.option('--init', 'init{create configfile}')

		program.parse(argv);
		const options = program.opts();
		this._options = options as T
	}

	protected _options: T
	get options(): T {
		return this._options
	}
}
