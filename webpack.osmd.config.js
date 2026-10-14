const path = require( 'node:path' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const { auxiliaryConfig } = require( './scripts/webpack-shared' );

const config = auxiliaryConfig( 'osmd-helpers' );
module.exports = {
	...config,
	entry: {
		queueable_attributes:
			'./src/QueueableAttributes/registerQueueableAttributes.jsx',
		'osmd-loader': './src/frontend/osmd-loader.js',
		new_block_detection: './src/new-block-detection.js',
		'react-jsx-runtime': './src/Compatibility/react-jsx-runtime.js',
	},
	output: {
		...config.output,
		filename: '[name].min.js',
		path: path.resolve( __dirname, 'build/osmd' ),
	},
	plugins: [
		...config.plugins,
		new CopyPlugin( {
			patterns: [
				{
					from: 'node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js',
					to: 'opensheetmusicdisplay.min.js',
					info: { minimized: true },
				},
			],
		} ),
	],
};
