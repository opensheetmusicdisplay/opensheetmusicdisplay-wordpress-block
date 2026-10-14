const path = require( 'node:path' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const {
	defaultConfig,
	dependencyExtraction,
	MiniCssExtractPlugin,
} = require( './scripts/webpack-shared' );

module.exports = {
	...defaultConfig,
	entry: {
		osmd_block: path.resolve( __dirname, 'src/osmd_block/index.js' ),
		pbdeeplink_block: path.resolve(
			__dirname,
			'src/pbdeeplink_block/index.js'
		),
		pbdeeplink_frontend: path.resolve(
			__dirname,
			'src/pbdeeplink_block/frontend.js'
		),
	},
	output: {
		...defaultConfig.output,
		filename: '[name].js',
		// The editor watcher must keep bundles emitted by the auxiliary builds.
		clean: { keep: /^(osmd|fonts|images)\// },
	},
	plugins: [
		...defaultConfig.plugins.filter(
			( plugin ) =>
				! [
					'DependencyExtractionWebpackPlugin',
					'MiniCssExtractPlugin',
				].includes( plugin.constructor.name )
		),
		new MiniCssExtractPlugin( {
			filename: 'styles/[name].css',
			chunkFilename: 'styles/[name].css',
		} ),
		dependencyExtraction(),
		new CopyPlugin( {
			patterns: [
				{
					from: 'node_modules/pb-deep-link/dist/endpoint.min.js',
					to: 'pbdeeplink/endpoint.min.js',
					info: { minimized: true },
				},
				{
					from: 'node_modules/pb-deep-link/dist/qrcode.min.js',
					to: 'pbdeeplink/qrcode.min.js',
					info: { minimized: true },
				},
				{
					from: 'node_modules/pb-deep-link/dist/responsive_shim.min.css',
					to: 'pbdeeplink/responsive_shim.min.css',
				},
				{ from: '**/*.json', to: '[name].json', context: 'src/' },
			],
		} ),
	],
};
