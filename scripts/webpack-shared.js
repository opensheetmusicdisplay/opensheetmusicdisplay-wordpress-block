const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const DependencyExtractionPlugin = require( '@wordpress/dependency-extraction-webpack-plugin' );
const path = require( 'node:path' );
const MiniCssExtractPlugin = require(
	require.resolve( 'mini-css-extract-plugin', {
		paths: [
			path.dirname(
				require.resolve( '@wordpress/scripts/package.json' )
			),
		],
	} )
);

// Keep custom globals in extraction so their WordPress handles reach .asset.php.
const globals = {
	opensheetmusicdisplay: [ 'opensheetmusicdisplay' ],
	PracticeBirdDeepLink: [ 'PracticeBirdDeepLink' ],
	'opensheetmusicdisplay-wordpress-block': [
		'opensheetmusicdisplay-wordpress-block',
	],
};
const handles = {
	opensheetmusicdisplay:
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_dist',
	PracticeBirdDeepLink: 'phonicscore_practicebird_deeplink_qrcode_library',
	'opensheetmusicdisplay-wordpress-block':
		'phonicscore_opensheetmusicdisplay_opensheetmusicdisplay_block_exports',
};

function dependencyExtraction() {
	return new DependencyExtractionPlugin( {
		requestToExternal: ( request ) => globals[ request ],
		requestToHandle: ( request ) => handles[ request ],
	} );
}

function auxiliaryConfig( name ) {
	return {
		mode: 'production',
		target: defaultConfig.target,
		resolve: defaultConfig.resolve,
		module: defaultConfig.module,
		optimization: {
			minimize: true,
			minimizer: defaultConfig.optimization.minimizer,
		},
		output: { uniqueName: name, clean: false },
		plugins: [ dependencyExtraction() ],
	};
}

module.exports = {
	defaultConfig,
	dependencyExtraction,
	auxiliaryConfig,
	MiniCssExtractPlugin,
};
