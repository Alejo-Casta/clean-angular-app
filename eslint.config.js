// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("@angular-eslint/eslint-plugin");
const angularTemplate = require("@angular-eslint/eslint-plugin-template");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/prefer-readonly-parameter-types": "off",
      
      // Angular specific rules
      "@angular-eslint/directive-selector": [
        "error",
        {
          "type": "attribute",
          "prefix": "app",
          "style": "camelCase"
        }
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          "type": "element",
          "prefix": "app",
          "style": "kebab-case"
        }
      ],
      "@angular-eslint/no-empty-lifecycle-method": "error",
      "@angular-eslint/no-host-metadata-property": "error",
      "@angular-eslint/no-input-rename": "error",
      "@angular-eslint/no-inputs-metadata-property": "error",
      "@angular-eslint/no-output-native": "error",
      "@angular-eslint/no-output-on-prefix": "error",
      "@angular-eslint/no-output-rename": "error",
      "@angular-eslint/no-outputs-metadata-property": "error",
      "@angular-eslint/use-lifecycle-interface": "error",
      "@angular-eslint/use-pipe-transform-interface": "error",
      
      // General code quality rules
      "prefer-const": "error",
      "no-var": "error",
      "no-console": "warn",
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-unused-expressions": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "brace-style": ["error", "1tbs"],
      "comma-dangle": ["error", "never"],
      "quotes": ["error", "single", { "avoidEscape": true }],
      "semi": ["error", "always"],
      "indent": ["error", 2],
      "max-len": ["error", { "code": 120, "ignoreUrls": true }],
      "object-curly-spacing": ["error", "always"],
      "array-bracket-spacing": ["error", "never"],
      
      // Clean Architecture specific rules
      "no-restricted-imports": [
        "error",
        {
          "patterns": [
            {
              "group": ["**/infrastructure/**"],
              "message": "Domain layer should not import from infrastructure layer"
            },
            {
              "group": ["**/presentation/**"],
              "message": "Domain and Application layers should not import from presentation layer"
            }
          ]
        }
      ]
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angularTemplate.configs.recommended,
      ...angularTemplate.configs.accessibility,
    ],
    rules: {
      "@angular-eslint/template/banana-in-box": "error",
      "@angular-eslint/template/eqeqeq": "error",
      "@angular-eslint/template/no-negated-async": "error",
      "@angular-eslint/template/use-track-by-function": "warn",
      "@angular-eslint/template/conditional-complexity": ["error", { "maxComplexity": 3 }],
      "@angular-eslint/template/cyclomatic-complexity": ["error", { "maxComplexity": 5 }],
      "@angular-eslint/template/no-call-expression": "error",
      "@angular-eslint/template/no-any": "warn",
    },
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      "@angular-eslint/no-empty-lifecycle-method": "off",
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "*.js",
      "*.mjs",
    ],
  }
);
