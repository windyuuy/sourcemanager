import { easytest } from "../src/aeasytest/AutoTest";
import { runCustomCmd } from "../src/runners/RunCmd"

const AutoTest = easytest.AutoTest
AutoTest.addFunc("test folder", () => {
    runCustomCmd([
        "", "",
        "-w", "./tests/test1/p1",
        "-t", "clone",
    ])

})

export function testAll() {
    // 启用测试
    easytest.testDefaults()
}

test('testall', () => {
    testAll()
});