/* istanbul ignore file */

import * as tss from "typescript/lib/tsserverlibrary";
import util from "util";
import CssParser from "./CssParser";
import ExportGenerator from "./ExportGenerator";
import FileUtils from "./FileUtils";
import IOptions from "./IOptions";
import Logger from "./Logger";
import ModuleResolver from "./ModuleResolver";

let logger: Logger;

const init = ({ typescript: ts }: { typescript: typeof tss }) => {
    const create = (info: tss.server.PluginCreateInfo): ts.LanguageService => {

        const options: IOptions = info.config.options || {};
        logger = new Logger(info.project.projectService.logger, options);

        logger.log(`Initialize with options: ${util.inspect(options, false, null, true)}`);

        const cssParser = new CssParser(logger, options);
        const exportGenerator = new ExportGenerator(options);
        const fileUtils = new FileUtils(options);

        const oldCreateLanguageServiceSourceFile = ts.createLanguageServiceSourceFile;
        // @ts-ignore
        ts.createLanguageServiceSourceFile = (fileName, scriptSnapshot, ...additionalParameters): ts.SourceFile => {

            if (fileUtils.isModulePath(fileName)) {
                logger.log(`Getting css snapshots from: ${fileName}`);

                const css = fileUtils.getSourceCode(scriptSnapshot);
                const classes = cssParser.getClasses(css);
                const dts = exportGenerator.generate(classes);

                // logger.log(dts);

                scriptSnapshot = ts.ScriptSnapshot.fromString(dts);
            }

            // @ts-ignore
            const sourceFile = oldCreateLanguageServiceSourceFile(fileName, scriptSnapshot, ...additionalParameters);
            if (fileUtils.isModulePath(fileName)) {
                sourceFile.isDeclarationFile = true;
            }

            return sourceFile;
        };

        const oldUpdateLanguageServiceSourceFile = ts.updateLanguageServiceSourceFile;
        // @ts-ignore
        ts.updateLanguageServiceSourceFile = (sourceFile, scriptSnapshot, ...rest): ts.SourceFile => {

            if (fileUtils.isModulePath(sourceFile.fileName)) {
                logger.log(`Getting css snapshots for: ${sourceFile.fileName}`);

                const css = fileUtils.getSourceCode(scriptSnapshot);
                const classes = cssParser.getClasses(css);
                const dts = exportGenerator.generate(classes);

                // logger.log(dts);

                scriptSnapshot = ts.ScriptSnapshot.fromString(dts);
            }

            // @ts-ignore
            sourceFile = oldUpdateLanguageServiceSourceFile(sourceFile, scriptSnapshot, ...rest);
            if (fileUtils.isModulePath(sourceFile.fileName)) {
                sourceFile.isDeclarationFile = true;
            }

            return sourceFile;
        };

        if (info.languageServiceHost.resolveModuleNames) {
            const resolver = new ModuleResolver(logger);

            logger.log(`Create resolver for resolveModuleNames`);
            info.languageServiceHost.resolveModuleNames = resolver.createResolver(info, fileUtils);
        }

        return info.languageService;
    };

    const getExternalFiles = (project: tss.server.Project): Array<string> | undefined => {
        const fileUtil = new FileUtils();

        return project.getFileNames().filter(fileUtil.isModulePath);
    };

    return {
        create,
        getExternalFiles,
    };
};

export = init;
