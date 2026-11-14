import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      curly: ["error", "all"],
      "no-console": "error",
      "max-lines": [
        "error",
        { max: 400, skipBlankLines: true, skipComments: true },
      ],
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "no-restricted-globals": [
        "error",
        {
          name: "setTimeout",
          message: "React to the event that justifies the delay.",
        },
        {
          name: "setInterval",
          message: "React to the event that justifies the repetition.",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSSatisfiesExpression",
          message: "Annotate what receives the value.",
        },
        {
          selector:
            "TSTypeReference[typeName.name=/^(Partial|Omit|Pick|Record)$/]",
          message: "Declare the shape, or use an enum and a switch.",
        },
        {
          selector: "TSMappedType",
          message: "Declare the shape, or use an enum and a switch.",
        },
        {
          selector: "TSConditionalType",
          message: "Declare the shape, or use function overloads.",
        },
        {
          selector: "TSUnionType > TSLiteralType > Literal[raw=/^[\"']/]",
          message: "Declare an enum.",
        },
        {
          selector: "JSXExpressionContainer > JSXEmptyExpression",
          message: "Write the comment outside the JSX, or drop it.",
        },
        {
          selector: "Literal[value=/-\\[/]",
          message: "Use a step of the theme scale, or add one to the theme.",
        },
        {
          selector: "TemplateElement[value.raw=/-\\[/]",
          message: "Use a step of the theme scale, or add one to the theme.",
        },
      ],
    },
  },
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "error",
    },
  },
];

export default eslintConfig;
