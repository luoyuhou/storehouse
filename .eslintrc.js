module.exports = {
  env: {
    "jest/globals": true,
    browser: true,
    es2020: true,
  },
  extends: [
    "airbnb",
    "airbnb-typescript",
    "prettier",
    "eslint:recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
    sourceType: "module",
  },
  plugins: ["react", "jest", "prettier"],
  rules: {
    "prettier/prettier": "warn",
    semi: "warn",
    quotes: ["error", "double"],
    "comma-dangle": "error",
    "object-curly-spacing": "error",
    "operator-linebreak": "off",
    "react/no-unescaped-entities": "warn",
    "react/prop-types": "off",
    "react/jsx-filename-extension": "off",
    "react/jsx-props-no-spreading": "off",
    "react/sort-comp": "warn",
    "react/no-this-in-sfc": "warn",
    "react/destructuring-assignment": "off",
    "react/no-unstable-nested-components": ["warn", { allowAsProps: true }],
    "jsx-a11y/label-has-associated-control": [
      2,
      {
        labelAttributes: ["label"],
        depth: 3,
      },
    ],
    "no-unused-vars": [
      "warn",
      { vars: "all", args: "after-used", ignoreRestSiblings: false },
    ],
    "jsx-a11y/no-static-element-interactions": "off",
    "jsx-a11y/click-events-have-key-events": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        tsx: "never",
        jsx: "never",
        ts: "never",
      },
    ],
  },
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"], // this loads <rootdir>/tsconfig.json to eslint
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
  overrides: [
    {
      files: ["**/*.js", "**/*.ts", "**/*.tsx"],
      env: { browser: true, es6: true, node: true },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:prettier/recommended",
      ],
      globals: { Atomics: "readonly", SharedArrayBuffer: "readonly" },
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      plugins: ["@typescript-eslint"],
      rules: {
        "react/require-default-props": [
          1,
          { forbidDefaultForRequired: true, ignoreFunctionalComponents: true },
        ],
        "@typescript-eslint/no-explicit-any": 2,
        "@typescript-eslint/no-unused-vars": [
          "warn",
          { argsIgnorePattern: "^_" },
        ],
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": ["error"],
        "import/prefer-default-export": 0,
        "react/display-name": [0, { ignoreTranspilerName: false }],
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "react/prop-types": "off",
        "react/forbid-prop-types": [2, { forbid: ["any"] }],
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": ["error"],
      },
    },
  ],
};
