module.exports = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/src/test/polyfills.js"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testMatch: [
    "<rootDir>/src/**/*.test.jsx",
    "<rootDir>/src/**/*.test.js",
  ],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/src/test/styleMock.js",
  },
};