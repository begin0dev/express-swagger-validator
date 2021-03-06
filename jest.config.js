module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules', 'lib'],
  moduleFileExtensions: ['ts', 'js'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/?(*.)(spec|test).(js|ts)'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
};
