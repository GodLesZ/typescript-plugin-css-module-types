import { SyncOptions as NodeSassOptions } from "node-sass";
import { ILoggerOptions } from "./Logger";

export default interface IOptions {
    camelCase?: CamelCaseOptions;
    customMatcher?: string;
    log?: ILoggerOptions;
    sass?: {
        renderOptions?: Partial<NodeSassOptions>;
    };
}

export type CamelCaseOptions = | true | "dashes" | "dashesOnly" | "only" | undefined;
