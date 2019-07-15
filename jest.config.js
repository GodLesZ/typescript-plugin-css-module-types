
module.exports = {
    preset: "ts-jest",
    globals: {
        "ts-jest": {
            diagnostics: false
        }
    },
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.ts",
        "!src/**/*.d.ts",
    ],
    coverageDirectory: "<rootDir>/reports/",
    coverageReporters: [
        "text-summary",
        "html"
    ],
    testEnvironment: "node",
};
