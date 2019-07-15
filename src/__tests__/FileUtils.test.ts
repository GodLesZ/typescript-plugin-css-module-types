import FileUtils from "../FileUtils";
import * as tss from "typescript/lib/tsserverlibrary";

describe("FileUtil", () => {

    it("should match `customMatcher` regexp", () => {
        const fileUtil = new FileUtils({ customMatcher: "\\.css$" });

        expect(fileUtil.isModulePath("./myfile.css")).toBe(true);
        expect(fileUtil.isModulePath("./myfile.m.css")).toBe(true);
        expect(fileUtil.isModulePath("./myfile.scss")).toBe(false);
        expect(fileUtil.isRelativeModulePath("../folder/myfile.css")).toBe(true);
        expect(fileUtil.isRelativeModulePath("../folder/myfile.m.css")).toBe(true);
        expect(fileUtil.isRelativeModulePath("../folders/myfile.scss")).toBe(false);
    });
    it("should get the source code of an script", () => {
        const fileContent = "some text";
        const fileUtil = new FileUtils();
        const MockedScript = jest.fn<tss.IScriptSnapshot, Array<null>>(() => ({
            getText: jest.fn().mockReturnValue(fileContent),
            getLength: jest.fn().mockReturnValue(42),
            getChangeRange: jest.fn(),
            dispose: jest.fn(),
        }));
        const script = new MockedScript();
        const sourceCode = fileUtil.getSourceCode(script);

        expect(sourceCode).toBe(fileContent);
        expect(script.getText).toBeCalledWith(0, 42);
    });
});
