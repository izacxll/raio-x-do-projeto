import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "public/vendor", "coverage", "playwright-report", "test-results", "referencias"] },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2023, globals: globals.browser },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Nenhuma cor solta no código: cores só em src/interface/estilos/tokens.css (seção 6 da especificação)
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#[0-9a-fA-F]{6}\b/]",
          message:
            "Cor solta no código: use um token de src/interface/estilos/tokens.css ou de src/interface/tokens.ts.",
        },
      ],
    },
  },
  {
    files: ["src/interface/tokens.ts", "tests/**"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.{js,ts}"],
    languageOptions: { globals: globals.node },
  },
);
