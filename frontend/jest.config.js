module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src/"],
  modulePaths: ["<rootDir>/src/"],
  moduleFileExtensions: ["ts", "js", "html"],
  transform: {
    "^.+\\.(ts|mjs|js)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.spec.json",
        isolatedModules: true
      }
    ]
  },
  testMatch: ["**/+(*.)+(spec).+(ts)"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "html", "text-summary"]
};

