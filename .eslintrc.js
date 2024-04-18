module.exports = {
	parser: "@typescript-eslint/parser",
	extends: "eslint:recommended",
	env: {
		browser: true,
		commonjs: true,
		es2021: true,
	},
	rules: {
		"no-constant-binary-expression": "error",
		indent: [ "warn", "tab", { SwitchCase: 1 } ],
		semi: [ "error", "never" ],
		"no-unused-vars": [ "error", { "vars": "all", "args": "all", "argsIgnorePattern": "^_" } ],
		"prefer-const": 0,
	},
}
