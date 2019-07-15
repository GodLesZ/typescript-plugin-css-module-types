import fs from "fs";
import path from "path";
import * as tss from "typescript/lib/tsserverlibrary";
import FileUtils from "./FileUtils";
import Logger from "./Logger";

export default class ModuleResolver {
    private readonly logger: Logger;

    public constructor(logger: Logger) {
        this.logger = logger;
    }

    public createResolver(info: tss.server.PluginCreateInfo, fileUtils: FileUtils) {

        const oldResolveModuleNames = info.languageServiceHost.resolveModuleNames!.bind(info.languageServiceHost);

        return (moduleNames: Array<string>, containingFile: string, reusedNames?: Array<string>) => {

            const resolvedModules = oldResolveModuleNames(moduleNames, containingFile, reusedNames);

            return moduleNames.map((moduleName, index) => {

                try {

                    if (fileUtils.isRelativeModulePath(moduleName)) {
                        return {
                            extension: tss.Extension.Dts,
                            isExternalLibraryImport: false,
                            resolvedFileName: path.resolve(path.dirname(containingFile), moduleName),
                        };
                    }

                    if (!fileUtils.isModulePath(moduleName)) {
                        return resolvedModules[index];
                    }

                    const resolvedPath = this.tryResolveModulePath(moduleName, containingFile, info);
                    this.logger.log(`  ${moduleName}: try resolved to = ${resolvedPath}`);
                    if (!resolvedPath) {
                        return resolvedModules[index];
                    }

                    return {
                        extension: tss.Extension.Dts,
                        isExternalLibraryImport: false,
                        resolvedFileName: path.resolve(resolvedPath),
                    };
                } catch (e) {
                    this.logger.log(`Error during resolving: ${e.toString()}`);
                    return resolvedModules[index];
                }
            });
        };
    }

    private getCssModulePathsFromLocations(
        failedLocations: ReadonlyArray<string>,
        baseUrl: string | undefined,
        filenameSuffix: string
    ) {
        // Filter to only one extension type, and remove that extension.
        // "Some/Path/File.module.css/index.ts" > "Some/Path/File.module.css"
        return failedLocations.reduce(
            (locations, location) => {
                if (!location.endsWith(filenameSuffix)) {
                    return locations;
                }

                if (baseUrl && !location.includes(baseUrl)) {
                    return locations;
                }

                return [...locations, location.replace(filenameSuffix, "")];
            },
            [] as Array<string>
        );
    }

    private tryResolveModulePath(moduleName: string, containingFile: string, info: tss.server.PluginCreateInfo) {
        /**
         * Hard estimation to look for the SCSS file
         * Example:
         *
         * tsconfig baseUrl: "/some/path/src/"
         * import styles from "SimpleComponent2.module.scss"
         *
         * Failed lookups by TS would be
         * /some/path/src/SimpleComponent2.module.scss/index.ts
         */

        const failedModuleLookups = info.project.getResolvedModuleWithFailedLookupLocationsFromCache(
            moduleName,
            containingFile,
        );
        const baseUrl = info.project.getCompilerOptions().baseUrl;
        // This is one of the suffixes TS is looking for
        const filenameSuffix = "/index.ts";

        // An array of paths TS searched for
        const failedLocations =
            (failedModuleLookups as unknown as tss.ResolvedTypeReferenceDirectiveWithFailedLookupLocations)
                .failedLookupLocations;

        const normalizedLocations = this.getCssModulePathsFromLocations(
            failedLocations,
            baseUrl,
            filenameSuffix
        );

        return normalizedLocations.find(location => fs.existsSync(location));
    }
}
