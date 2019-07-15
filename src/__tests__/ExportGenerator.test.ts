import ExportGenerator from "../ExportGenerator";
import { CamelCaseOptions } from "../IOptions";

describe("ExportGenerator", () => {
    const classNames = [
        "class-name-a",
        "classNameB",
        "class-Name-C",
        "__class_nAmeD--",
    ];
    const tests: Array<CamelCaseOptions> = [true, "dashes", "dashesOnly", "only"];

    it(`should not transform classes when no option is set`, () => {
        const generator = new ExportGenerator({});
        const transformedClasses = classNames.map(className => generator.transformClassName(className));

        expect(transformedClasses).toMatchSnapshot();
    });

    tests.forEach(option => {
        it(`should transform classes correctly when \`camelCase\` set to \`${option}\``, () => {
            const generator = new ExportGenerator({
                camelCase: option,
            });
            const transformedClasses = classNames.map(className => generator.transformClassName(className));

            expect(transformedClasses).toMatchSnapshot();
        });
    });

    it("creates exports without constants if no camel-case class was found", () => {
        const generator = new ExportGenerator({});
        const exports = generator.generate({
            "some-class": "some-class----HASH",
            "some-class-2": "some-class-2----HASH",
            "const": "const----HASH",
        });

        expect(exports).toMatchSnapshot();
    });

    it("creates exports with constants for every camel-case class", () => {
        const generator = new ExportGenerator({});
        const exports = generator.generate({
            "camelCase": "camel-case----HASH",
            "camelCase2": "camel-case-2----HASH",
            "some-class": "some-class----HASH",
            "const": "const----HASH",
        });

        expect(exports).toMatchSnapshot();
    });
});
