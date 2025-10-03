module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: null,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["@typescript-eslint"],
  overrides: [
    {
      files: ["*.js"],
      parser: "espree",
      extends: ["eslint:recommended"],
      plugins: [],
    },
  ],
  rules: {},
};
