import tseslint from "typescript-eslint";
import eslintPluginImport from "eslint-plugin-import";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
    {
        files: ["demo/**/*.ts", "lib/**/*.ts"],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            parser: tseslint.parser,
            parserOptions: {
                project: "./tsconfig.json",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            prettier: prettierPlugin,
        },
        rules: {
            ...prettierConfig.rules,
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "prettier/prettier": "error",
            "no-console": ["warn", { allow: ["error", "warn"] }],
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            indent: ["error", 4],
            "no-restricted-imports": [
                "error",
                {
                    patterns: ["lib/*"],
                },
            ],
        },
        // Remove settings from here if they are fully handled in the second block
        ignores: ["dist/**", "node_modules/**", "vite.config.ts"],
    },
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            eslintPluginImport.flatConfigs.recommended,
            eslintPluginImport.flatConfigs.typescript,
        ],
        rules: {
            "import/no-absolute-path": "error",
            "import/no-internal-modules": [
                "error",
                {
                    forbid: ["lib/*"],
                },
            ],
            "import/order": [
                "error",
                {
                    groups: [
                        "builtin",
                        "external",
                        "internal",
                        "parent",
                        "sibling",
                        "index",
                    ],
                    "newlines-between": "always",
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true,
                    },
                    pathGroups: [
                        {
                            pattern: "~/**",
                            group: "internal",
                        },
                    ],
                    pathGroupsExcludedImportTypes: ["builtin"],
                },
            ],
            // Add the core sort-imports rule for member sorting
            "sort-imports": [
                "error",
                {
                    ignoreCase: true, // Match case-insensitivity with import/order
                    ignoreDeclarationSort: true, // IMPORTANT: Let import/order handle statement sorting
                    ignoreMemberSort: false, // Ensure members are sorted
                    memberSyntaxSortOrder: [
                        "none",
                        "all",
                        "multiple",
                        "single",
                    ], // Default
                    allowSeparatedGroups: true, // Can help with comment attachment if using member groups
                },
            ],
        },
        settings: {
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: "./tsconfig.json",
                },
                node: true,
            },
            "import/parsers": {
                "@typescript-eslint/parser": [".ts", ".tsx"],
            },
        },
    }
);
