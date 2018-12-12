module.exports = {
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "<rootDir>/test/preprocessor.js"
  },
  moduleDirectories: [
    "node_modules"
  ],
  testMatch: [
    "**/?(*.)spec.ts?(x)"
  ],
  timers: "fake",
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/!(*.driver).{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
  ],
};