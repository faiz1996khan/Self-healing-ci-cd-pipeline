import js from "@eslint/js";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**"
    ]
  },

  js.configs.recommended
];