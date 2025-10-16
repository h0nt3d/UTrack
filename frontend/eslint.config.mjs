// Modifications made to config file due to issues with ESLint.

import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import css from "@eslint/css";

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    ...js.configs.recommended,
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: { ...globals.browser, ...globals.node },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: { react: pluginReact },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off", 
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "semi": "error",
      "camelcase": "warn"
    },
  },
  {
    files: ["**/*.json"],
    ...json.configs.recommended,
  },
  {
    files: ["**/*.md"],
    ...markdown.configs.recommended,
  },
  {
    files: ["**/*.css"],
    ...css.configs.recommended,
  },
];
