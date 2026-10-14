const wordpress = require( '@wordpress/scripts/config/eslint.config.cjs' );

module.exports = [
	...wordpress,
	{
		files: [ 'scripts/**/*.js', 'webpack*.js', 'eslint.config.cjs' ],
		languageOptions: {
			sourceType: 'commonjs',
			globals: {
				require: 'readonly',
				module: 'readonly',
				process: 'readonly',
				__dirname: 'readonly',
			},
		},
		// These files are command-line tools whose output is their user interface.
		rules: { 'no-console': 'off' },
	},
];
