import { CSSExports } from "icss-utils";
import { camelCase } from "lodash";
import reserved from "reserved-words";
import IOptions from "./IOptions";

const dashesCamelCase = (className: string) => {
    return className.replace(/-+(\w)/g, (match, firstLetter) => firstLetter.toUpperCase());
};

export default class ExportGenerator {
    private static readonly NOT_CAMELCASE_REGEXP = /[\-_]/;

    private readonly options: IOptions;

    public constructor(options: IOptions) {
        this.options = options;
    }

    public generate(classes: CSSExports) {
        const isCamelCase = (className: string) => !ExportGenerator.NOT_CAMELCASE_REGEXP.test(className);
        const isReservedWord = (className: string) => !reserved.check(className);

        const classNames = Object.keys(classes)
            .map(className => this.transformClassName(className))
            // Flatter array because transformClassName() may return multiple classes
            .reduce((previousValue: Array<string> = [], currentValue: Array<string>) => {
                return previousValue.concat(currentValue);
            }, []);

        const camelCasedKeys = classNames
            .filter(isCamelCase)
            .filter(isReservedWord)
            .map(className => `export const ${className}: string;`);

        const defaultExport = `\
declare const styles: {
    ${classNames.map(className => `"${className}": string;`).join("\n  ")}
};
export default styles;
`;

        if (camelCasedKeys.length) {
            return `${defaultExport}${camelCasedKeys.join("\n")}\n`;
        }

        return defaultExport;
    }

    public transformClassName(className: string) {
        const entries: Array<string> = [];

        switch (this.options.camelCase) {
            case true:
                entries.push(className);
                const camelCaseClassName = camelCase(className);
                if (camelCaseClassName !== className) {
                    entries.push(camelCaseClassName);
                }
                break;

            case "dashes":
                entries.push(className);
                const dashesCamelCaseClassName = dashesCamelCase(className);
                if (dashesCamelCaseClassName !== className) {
                    entries.push(dashesCamelCaseClassName);
                }
                break;

            case "only":
                entries.push(camelCase(className));
                break;

            case "dashesOnly":
                entries.push(dashesCamelCase(className));
                break;

            default:
                entries.push(className);
                break;
        }

        return entries;
    }
}
