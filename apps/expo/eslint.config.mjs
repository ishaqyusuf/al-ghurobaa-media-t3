import baseConfig from "@acme/eslint-config/base";
import { customConfig } from "@acme/eslint-config/custom";
import reactConfig from "@acme/eslint-config/react";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: [".expo/**", "expo-plugins/**"],
  },
  ...baseConfig,
  ...reactConfig,
  ...customConfig,
];
