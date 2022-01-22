module.exports = {
	root: true,
	extends: ['eslint:recommended', 'standard'],
	plugins: ['svelte3'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	rules: {
		'no-multiple-empty-lines': [ 'error', { max: 1, maxBOF: 2, maxEOF: 0 } ]
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
		mocha: true
	}
};
