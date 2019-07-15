import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as tss from "typescript/lib/tsserverlibrary";
import IOptions from "./IOptions";

export interface ILoggerOptions {
    enabled?: boolean;
    filePath?: string;
}

export default class Logger {
    // @ts-ignore
    private readonly options: ILoggerOptions;
    private readonly tsLogger: tss.server.Logger | null = null;

    private get logPath() {
        const basePath = "/logs/ts-log.log";
        return this.options.filePath
            ? path.join(this.options.filePath, basePath)
            : path.join(os.homedir(), basePath);
    }

    public constructor(tsLogger: tss.server.Logger, options: IOptions | null = null) {
        this.tsLogger = tsLogger;
        this.options = {
            ...(options ? options.log : {})
        };
    }

    public log(message: string) {
        if (!this.options.enabled) {
            return;
        }

        fs.appendFileSync(this.logPath, message + "\n");

        if (this.tsLogger) {
            this.tsLogger.info(`[DEBUG] ${message}\n`);
        }
    }
}
