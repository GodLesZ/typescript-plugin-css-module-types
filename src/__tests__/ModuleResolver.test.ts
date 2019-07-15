import * as fs from "fs";
import * as tss from "typescript/lib/tsserverlibrary";
import FileUtils from "../FileUtils";
import ModuleResolver from "../ModuleResolver";
import Logger from "../Logger";

const LoggerMock = jest.fn(() => ({
    log: jest.fn(),
}));
// @ts-ignore
const logger: Logger = new LoggerMock();

jest.mock("fs");
// @ts-ignore
const mockedFs: jest.Mocked<typeof import("fs")> = fs;

describe("ModuleResolver", () => {
    it("should resolve library paths correctly", () => {
        const filePath = "";
        const moduleNames = [
            "tslib",
            "react",
        ];
        const baseResolvedModules = [
            {
                resolvedFileName: "/some/path/node_modules/tslib/tslib.d.ts",
                extension: ".d.ts",
                isExternalLibraryImport: true,
            },
            {
                resolvedFileName: "/some/path/node_modules/@types/react/index.d.ts",
                extension: ".d.ts",
                isExternalLibraryImport: true,
            },
        ];

        const fileUtils = new FileUtils();
        const resolver = new ModuleResolver(logger);
        const pluginInfo: tss.server.PluginCreateInfo = {
            // @ts-ignore
            languageServiceHost: {
                resolveModuleNames: jest.fn().mockReturnValue(baseResolvedModules),
            }
        };

        const resolverFunction = resolver.createResolver(pluginInfo, fileUtils);
        const resolvedModules = resolverFunction(moduleNames, filePath);

        expect(resolvedModules.length).toBe(moduleNames.length);
        expect(resolvedModules[0]).toMatchObject(baseResolvedModules[0]!);
        expect(resolvedModules[1]).toMatchObject(baseResolvedModules[1]!);
    });

    it("should resolve relative paths correctly", () => {
        const filePath = "/some/path/src/SimpleComponent2.tsx";
        const moduleNames = [
            "./SimpleComponent.module.scss",
        ];
        const baseResolvedModules = [
            undefined,
        ];

        const fileUtils = new FileUtils();
        const resolver = new ModuleResolver(logger);
        const pluginInfo: tss.server.PluginCreateInfo = {
            // @ts-ignore
            languageServiceHost: {
                resolveModuleNames: jest.fn().mockReturnValue(baseResolvedModules),
            }
        };

        const resolverFunction = resolver.createResolver(pluginInfo, fileUtils);
        const resolvedModules = resolverFunction(moduleNames, filePath);

        expect(resolvedModules.length).toBe(moduleNames.length);
        expect(resolvedModules[0]).toMatchObject({
            extension: ".d.ts",
            isExternalLibraryImport: false,
            resolvedFileName: "/some/path/src/SimpleComponent.module.scss",
        });
    });

    it("should resolve absolute paths correctly", () => {
        const filePath = "/some/path/src/SimpleComponent2.tsx";
        const moduleNames = [
            "SimpleComponent2.module.scss",
        ];
        const baseResolvedModules = [
            undefined,
        ];

        const fileUtils = new FileUtils();
        const resolver = new ModuleResolver(logger);
        const pluginInfo: tss.server.PluginCreateInfo = {
            // @ts-ignore
            languageServiceHost: {
                resolveModuleNames: jest.fn().mockReturnValue(baseResolvedModules),
            },
            // @ts-ignore
            project: {
                getCompilerOptions: jest.fn(() => ({
                    baseUrl: "/some/path/src",
                })),
                getResolvedModuleWithFailedLookupLocationsFromCache: jest.fn(() => ({
                    resolvedModule: undefined,
                    failedLookupLocations: [
                        "/some/path/src/SimpleComponent2.module.scss.ts",
                        "/some/path/src/SimpleComponent2.module.scss.d.ts",
                        "/some/path/src/SimpleComponent2.module.scss/index.js",
                        "/some/path/src/SimpleComponent2.module.scss/index.ts",
                    ]
                })),
            }
        };

        mockedFs.existsSync.mockReturnValue(true);

        const resolverFunction = resolver.createResolver(pluginInfo, fileUtils);
        const resolvedModules = resolverFunction(moduleNames, filePath);

        expect(resolvedModules.length).toBe(moduleNames.length);
        expect(mockedFs.existsSync).toHaveBeenCalledWith("/some/path/src/SimpleComponent2.module.scss");
        expect(resolvedModules[0]).toMatchObject({
            extension: ".d.ts",
            isExternalLibraryImport: false,
            resolvedFileName: "/some/path/src/SimpleComponent2.module.scss",
        });
    });

    it("should return undefined for absolute paths if baseUrl does not match", () => {
        const filePath = "/some/path/src/SimpleComponent2.tsx";
        const moduleNames = [
            "SimpleComponent2.module.scss",
        ];
        const baseResolvedModules = [
            undefined,
        ];

        const fileUtils = new FileUtils();
        const resolver = new ModuleResolver(logger);
        const pluginInfo: tss.server.PluginCreateInfo = {
            // @ts-ignore
            languageServiceHost: {
                resolveModuleNames: jest.fn().mockReturnValue(baseResolvedModules),
            },
            // @ts-ignore
            project: {
                getCompilerOptions: jest.fn(() => ({
                    baseUrl: "/different/base/path",
                })),
                getResolvedModuleWithFailedLookupLocationsFromCache: jest.fn(() => ({
                    resolvedModule: undefined,
                    failedLookupLocations: [
                        "/some/path/src/SimpleComponent2.module.scss/index.ts",
                    ]
                })),
            }
        };

        const resolverFunction = resolver.createResolver(pluginInfo, fileUtils);
        const resolvedModules = resolverFunction(moduleNames, filePath);

        expect(resolvedModules.length).toBe(moduleNames.length);
        expect(resolvedModules[0]).toBe(undefined);
    });
});
