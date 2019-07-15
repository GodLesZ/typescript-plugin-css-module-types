import IOptions from "./IOptions";
import * as tss from "typescript/lib/tsserverlibrary";

export default class FileUtils {
    private static readonly DEFAULT_MODULE_REGEX = /\.module\.scss$/;
    private readonly moduleRegex: RegExp;

    public constructor(options: IOptions | null = null) {
        this.moduleRegex = options && options.customMatcher
            ? new RegExp(options.customMatcher)
            : FileUtils.DEFAULT_MODULE_REGEX;
    }

    public isModulePath(filepath: string) {
        return this.moduleRegex.test(filepath);
    }

    public isRelativeModulePath(filepath: string) {
        return this.isModulePath(filepath) && this.isRelativePath(filepath);
    }

    public getSourceCode(script: tss.IScriptSnapshot) {
        return script.getText(0, script.getLength());
    }

    private isRelativePath(fileName: string) {
        return /^\.\.?($|[\\/])/.test(fileName);
    }
}
