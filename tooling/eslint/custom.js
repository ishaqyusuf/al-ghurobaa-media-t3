import tseslint from "typescript-eslint";

export const customConfig = tseslint.config({
  files: ["**/*.js", "**/*.ts", "**/*.tsx"],
  rules: {
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-redundant-type-constituents": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/no-unnecessary-condition": "off",

    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "@typescript-eslint/require-await": "off",

    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/prefer-optional-chain": "off",
  },
});
