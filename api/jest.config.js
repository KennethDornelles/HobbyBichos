module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    // Use ts-jest for .ts files and babel-jest for .js files
    // This ensures that both TypeScript and JavaScript files are correctly transformed.
    // The 'ts-jest' preset handles TypeScript compilation.
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverage: true,
  coverageDirectory: './coverage',
  coverageReporters: ['lcov', 'text', 'clover'],
  collectCoverageFrom: [
    'src/**/*.service.ts',
    'src/**/*.controller.ts',
    'src/**/*.provider.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.entity.ts',
  ],
  testEnvironment: 'node',
  coverageProvider: 'v8', // Linha adicionada para resolver o problema do test-exclude
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
