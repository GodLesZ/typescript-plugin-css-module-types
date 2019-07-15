import * as fs from "fs";
import * as tss from "typescript/lib/tsserverlibrary";
import Logger from "../Logger";

// @ts-ignore
const TsLoggerMock = jest.fn<tss.server.Logger, Array<null>>(() => ({
    info: jest.fn(),
}));

jest.mock("fs");
// @ts-ignore
const mockedFs: jest.Mocked<typeof import("fs")> = fs;

describe("Logger", () => {

    it("should do nothing of not enabled", () => {
        const logger = new Logger(new TsLoggerMock(), null);

        logger.log("Test");
    });

    it("should write to file if enabled", () => {
        const tsLogger = new TsLoggerMock();
        const logger = new Logger(tsLogger, {
            log: {
                enabled: true,
            }
        });

        logger.log("Test");
        expect(mockedFs.appendFileSync).toHaveBeenCalledWith(expect.any(String), expect.stringContaining("Test"));
        expect(tsLogger.info).toHaveBeenCalledWith(expect.stringContaining("[DEBUG] Test"));
    });
});
