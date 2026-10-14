const path = require( 'node:path' );
const { auxiliaryConfig } = require( './scripts/webpack-shared' );

const config = auxiliaryConfig( 'osmd-exports' );
module.exports = {
	...config,
	entry: {
		'opensheetmusicdisplay-wordpress-block':
			'./src/opensheetmusicdisplay-wordpress-block.js',
	},
	output: {
		...config.output,
		filename: '[name].min.js',
		path: path.resolve( __dirname, 'build/osmd' ),
		library: { name: 'opensheetmusicdisplay-wordpress-block', type: 'umd' },
		globalObject: 'globalThis',
	},
};
