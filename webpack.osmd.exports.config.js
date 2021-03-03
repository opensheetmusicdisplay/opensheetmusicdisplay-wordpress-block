const path = require('path');

module.exports = [
{
  externals: {
    'opensheetmusicdisplay-wordpress-block': 'window["opensheetmusicdisplay-wordpress-block"]',
    opensheetmusicdisplay: 'opensheetmusicdisplay',
    externalsType: 'umd'
  },
  entry: {
            'opensheetmusicdisplay-wordpress-block': './src/opensheetmusicdisplay-wordpress-block.js',
        },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'build/osmd'),
    library: 'opensheetmusicdisplay-wordpress-block',
    libraryTarget: 'umd'
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
  }
}];