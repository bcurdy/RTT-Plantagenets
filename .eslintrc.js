module.exports = {
	parser: "@typescript-eslint/parser",
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended",
	],
	plugins: [
		"@typescript-eslint"
	],
	env: {
		browser: true,
		commonjs: true,
		es2021: true,
	},
	rules: {
		"no-constant-binary-expression": "error",
		indent: [ "warn", "tab", { SwitchCase: 1 } ],
		semi: [ "error", "never" ],
		"prefer-const": 0,
		"no-unused-vars": "off",
		"@typescript-eslint/no-unused-vars": [ "error", { "vars": "all", "args": "all", "argsIgnorePattern": "^_" } ],
		"@typescript-eslint/no-explicit-any": "off",
	},
}
