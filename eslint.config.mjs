import eslint from "@eslint/js";
import typescriptParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import unusedImportsPlugin from "eslint-plugin-unused-imports";
import reactPlugin from "eslint-plugin-react";
import * as emotionPlugin from "@emotion/eslint-plugin";
import prettierExtends from "eslint-config-prettier";
import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import hooksPlugin from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const compat = new FlatCompat();
const globalToUse = {
  ...globals.browser,
  ...globals.serviceworker,
  ...globals.es2021,
  ...globals.worker,
  ...globals.node,
};
const ignores = [
  "client/cypress/plugins/index.js",
  ".lintstagedrc.js",
  ".next/**/*",
  ".plasmo/**/*",
  "**/.next/**/*",
  "**/.yarn/**/*",
  "**/.expo/**/*",
  "**/dist/**/*",
  "public/js/*",
  ".yarn/js/*",
  "ui/out/**/*",
  "ios/**/*",
  "build/**/*",
  "android/**/*",
  "electron/build/**/*",
  "public/*.js",
  "public/*.map",
];
export default tseslint.config(
  {
    extends: [
      {
        ignores,
      },
      prettierExtends,
      // reactExtends,
      // next,
      ...fixupConfigRules(compat.extends("plugin:@next/next/core-web-vitals")),
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    settings: {
      react: { version: "detect" },
    },
    plugins: {
      prettierPlugin,
      "unused-imports": fixupPluginRules(unusedImportsPlugin),
      react: fixupPluginRules(reactPlugin),
      emotionPlugin,
      "react-hooks": fixupPluginRules(hooksPlugin),
    },
    rules: {
      "no-constant-condition": ["error", { checkLoops: false }],
      "react/react-in-jsx-scope": "off",
      "react/no-unknown-property": "off",
      "@typescript-eslint/ban-types": "off",
      "react/self-closing-comp": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "no-prototype-builtins": "off",
      "no-html-link-for-pages": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "prefer-const": "error",
      curly: ["error", "all"],
      "no-async-promise-executor": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-empty": "off",
      "no-case-declarations": "off",
      "no-control-regex": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
        },
      ],
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "unused-imports/no-unused-imports": "error",
      "object-shorthand": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { varsIgnorePattern: "^_", argsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
    languageOptions: {
      parser: typescriptParser,
      globals: globalToUse,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  { ignores },
);
