module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/lib/',
    '/dist/',
    '/tests/.*\\.js$/'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '\\.(resx|xml)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '^@msinternal/ecs-flight$': '<rootDir>/tests/__mocks__/fileMock.js',
    '^@ms/odsp-core-bundle$': '<rootDir>/tests/__mocks__/fileMock.js',
    '^@ms/odsp-datasources/lib/interfaces/ISpPageContext$': '<rootDir>/tests/__mocks__/fileMock.js'
  }
};
