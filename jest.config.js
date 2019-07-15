
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
    testEnvironment: "node",
};
