import * as fs from "fs";
import * as path from "path";
import CssParser from "../CssParser";
import Logger from "../Logger";

// @ts-ignore
const LoggerMock = jest.fn<Logger, Array<null>>(() => ({
    log: jest.fn(),
    setTsLogger: jest.fn(),
}));

const testFileNames = [
    "test-css.module.css",
    "test-scss.module.scss",
    "empty.module.scss",
];

describe("CssParser", () => {
    testFileNames.forEach(fileName => {
        it(`should get all classes from '${fileName}'`, () => {
            const cssParser = new CssParser(new LoggerMock(), {});

            const fileContent = fs.readFileSync(path.join(__dirname, "fixtures", fileName), "utf8");
            const classes = cssParser.getClasses(fileContent);

            expect(classes).toMatchSnapshot();
        });
    });

    it("should return empty object on error", () => {
        const cssParser = new CssParser(new LoggerMock(), {});
        const classes = cssParser.getClasses(`invalid syntax`);
        expect(classes).toMatchObject({});
    });
});
