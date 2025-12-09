import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default tseslint.config(
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // ===== Règles de formatage =====
      "indent": ["error", 2], // Indentation à 2 espaces
      "quotes": ["error", "double"], // Guillemets doubles obligatoires
      "semi": ["error", "always"], // Point-virgule obligatoire
      "comma-dangle": ["error", "always-multiline"], // Virgule finale sur plusieurs lignes
      
      // ===== Règles React/TypeScript =====
      "react/react-in-jsx-scope": "off", // Pas besoin d'importer React en React 17+
      "react/prop-types": "off", // Pas besoin avec TypeScript
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }], // Avertir pour les variables non utilisées (sauf celles préfixées par _)
      "@typescript-eslint/no-explicit-any": "warn", // Avertir pour l'usage de 'any'
      
      // ===== Règles de bonnes pratiques =====
      "no-console": ["warn", { allow: ["warn", "error"] }], // Pas de console.log en prod
      "prefer-const": "error", // Utiliser const quand possible
      "no-var": "error", // Interdire var
      "eqeqeq": ["error", "always"], // Toujours utiliser === au lieu de ==
      
      // ===== Règles d'organisation =====
      "import/order": ["error", {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always"
      }], // Organiser les imports
    },
  }
);
