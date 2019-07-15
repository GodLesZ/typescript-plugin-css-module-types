import path from "path";
import { extractICSS } from "icss-utils";
import nodeSass, { SyncImporter, SyncOptions } from "node-sass";
import postcss from "postcss";
import postcssIcssSelectors from "postcss-icss-selectors";
import IOptions from "./IOptions";
import Logger from "./Logger";

export default class CssParser {
    private readonly processor: postcss.Processor;
    private readonly options: IOptions;
    private readonly logger: Logger;

    public constructor(logger: Logger, options: IOptions) {
        this.logger = logger;
        this.options = options;
        this.processor = postcss([
            postcssIcssSelectors({ mode: "local" }),
        ]);
    }

    public getClasses(scss: string) {
        try {
            const renderedCss = nodeSass.renderSync(this.getSassOptions(scss)).css.toString();
            const processedCss = this.processor.process(renderedCss);
            const rootNode = processedCss.root;

            return extractICSS(rootNode).icssExports;
        } catch (e) {
            this.logger.log(`Error during getClasses: ${e.toString()}`);
            this.logger.log(e.stack);

            return {};
        }
    }

    private getSassOptions(data: string): SyncOptions {
        // @ts-ignore
        const nodeModuleImporter: SyncImporter = (url: string) => {
            if (url[0] === "~") {
                url = path.resolve("node_modules", url.substr(1));
            }

            return { file: url };
        };

        return {
            data,
            importer: nodeModuleImporter,
            ...(this.options.sass && this.options.sass.renderOptions ? this.options.sass.renderOptions : {}),
        };
    }
}
