const path = require('path');

module.exports = [
{
  entry: {
            'osmd-loader': './src/osmd/osmd-loader.ts'
        },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'build/osmd'),
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
  }
}];