/**
 * @file ESLint configuration for the WhiteBear backend.
 * @module eslint.config
 * @description This configuration sets up ESLint for the WhiteBear backend project, enforcing code quality and consistency. It includes rules for best practices, potential errors, and stylistic preferences.
 */

module.exports = {
  root: true,
  env: {
    node: true,
    es2024: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  extends: ["eslint:recommended"],
  rules: {
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "no-console": "off",
    eqeqeq: ["error", "always"],
    curly: ["error", "all"],
    semi: ["error", "always"],
    quotes: ["error", "single", { avoidEscape: true }],
    indent: ["error", 2, { SwitchCase: 1 }],
    "comma-dangle": ["error", "never"],
  },
};
