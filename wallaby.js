module.exports = function (wallaby) {

  return {
    files: [
      'src/**/*.{ts?(x),js}',
      'test/**/*.{ts?(x),js}',
      '!src/**/?(*.)spec.ts?(x)',
      'jest.config.js',
      'tsconfig.json',
    ],
    tests: ['src/**/?(*.)spec.ts?(x)'],
    env: {
      type: 'node',
      runner: 'node'
    },
    setup: function (wallaby) {
      const jestConfig = require('./jest.config');
      delete jestConfig.transform;
      delete jestConfig.moduleFileExtensions;
      jestConfig.globals = { __DEV__: true };
      wallaby.testFramework.configure(jestConfig);
    },
    testFramework: 'jest',
    compilers: {
      '**/*.ts?(x)': wallaby.compilers.typeScript()
    },
    env: {
      type: 'node',
    },
  };
};