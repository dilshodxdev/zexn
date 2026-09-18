// Flat config (ESLint 9). Barcha workspace'lar uchun bitta umumiy config.
// Client'da qo'shimcha React qoidalari apps/client/eslint.config.js ichida.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["**/dist/**", "**/build/**", "**/node_modules/**", "**/*.tsbuildinfo"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      // `_` prefiksli argument/o'zgaruvchi ataylab ishlatilmagan deb hisoblanadi
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
);
