const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
{
  externals: {
    '@wordpress/block-editor': 'wp.blockEditor',
    '@wordpress/components': 'wp.components',
    '@wordpress/compose': 'wp.compose',
    '@wordpress/data': 'wp.data',
    '@wordpress/i18n': 'wp.i18n',
    opensheetmusicdisplay: 'opensheetmusicdisplay',
    'opensheetmusicdisplay-wordpress-block': 'window["opensheetmusicdisplay-wordpress-block"]',
    externalsType: 'umd'
  },
  entry: {
            'queueable_attributes': './src/QueueableAttributes/registerQueueableAttributes.jsx',
            'osmd-loader': './src/frontend/osmd-loader.js',
            'new_block_detection': './src/new-block-detection.js'
        },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'build/osmd')
  },
  resolve: {
    // Add '.ts' and '.tsx' as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    module: {
        rules: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                // loader: 'awesome-typescript-loader',
                exclude: /(node_modules|bower_components)/
            },
            {
              test: /\.m?jsx$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: 'babel-loader',
                options: {
                  presets: ['@babel/preset-env', '@babel/preset-react']
                }
              }
            }
        ]
    },
  optimization: {
    minimize: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {from: 'node_modules/opensheetmusicdisplay/**/opensheetmusicdisplay.min.js', to: 'opensheetmusicdisplay.min.js'}
      ]
    })
  ]
}];