module.exports = {
  root: true,
  env: {
    browser: true,
    es2023: true,
  },
  ignorePatterns: ["dist/", "node_modules/"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
  },
};
