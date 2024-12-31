import baseConfig from "@acme/eslint-config/base";
import { customConfig } from "@acme/eslint-config/custom";

/** @type {import('typescript-eslint').Config} */
export default [
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  ...customConfig,
];
