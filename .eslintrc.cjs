module.exports = {
	root: true,
	extends: ['eslint:recommended', 'standard'],
	plugins: ['svelte'],
	overrides: [{ 
		files: ['*.svelte'],
		parser: 'svelte-eslint-parser',
		rules: {
			'import/first': 0,
			'no-unused-vars': 'off',
			'no-inner-declarations': 'off',
			'no-self-assign': 'off'
		}
	}],
	rules: {
		'no-multiple-empty-lines': [ 'error', { max: 1, maxBOF: 2, maxEOF: 0 } ],
		'no-trailing-spaces': 'error'
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2022
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
		mocha: true
	}
};
