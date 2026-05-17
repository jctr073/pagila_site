import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "next-env.d.ts",
    // Design reference — JSX prototypes that share globals via a single
    // <script> tag in Pagila Admin.html. They're not production code,
    // not bundled, and intentionally violate the "no implicit globals"
    // rule. See design_handoff_pagila_admin/README.md §10.
    "design_handoff_pagila_admin/**",
  ]),
]);

export default eslintConfig;
