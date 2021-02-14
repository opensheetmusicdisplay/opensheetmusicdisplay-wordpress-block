const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = [
{
  externals: {
    opensheetmusicdisplay: 'opensheetmusicdisplay',
    externalsType: 'umd'
  },
  entry: {
            'osmd-loader': './src/frontend/osmd-loader.ts',
            'export': './src/export.js',

        },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'build/osmd'),
    library: 'opensheetmusicdisplay-wordpress-block',
    libraryTarget: 'umd'
  },
  resolve: {
    // Add '.ts' and '.tsx' as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                // loader: 'awesome-typescript-loader',
                exclude: /(node_modules|bower_components)/
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