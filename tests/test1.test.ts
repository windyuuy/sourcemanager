import { easytest } from "../src/aeasytest/AutoTest";
import { runCustomCmd } from "../src/runners/RunCmd"

test('test folder', () => {
    runCustomCmd([
        "", "",
        "-w", "./tests/test1/p1",
        "-t", "clone",
    ])
});

test('test init', () => {
    runCustomCmd([
        "", "",
        "-w", "./tests/test1/p3",
        "--init",
    ])
});