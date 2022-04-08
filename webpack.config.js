const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require( 'path' );
const CopyPlugin = require("copy-webpack-plugin");

for(let pluginIdx = 0; pluginIdx < defaultConfig.plugins.length; pluginIdx++){
  const nextPlugin = defaultConfig.plugins[pluginIdx];
  if(nextPlugin.options && nextPlugin.options.filename === '[name].css'){
    nextPlugin.options.filename = 'styles/[name].css';
    nextPlugin.options.chunkFilename = 'styles/[name].css';
  }
}

module.exports = {
    ...defaultConfig,
    externals: {
      "PracticeBirdDeepLink": "PracticeBirdDeepLink"
    },
    entry: {
      osmd_block: path.resolve( process.cwd(), 'src/osmd_block', 'index.js' ),
      pbdeeplink_block: path.resolve( process.cwd(), 'src/pbdeeplink_block', 'index.js' ),
    },
    output: {
      ...defaultConfig.output,
      filename: '[name].js'
    },
    externals: {
        'opensheetmusicdisplay-wordpress-block': 'window["opensheetmusicdisplay-wordpress-block"]',
        opensheetmusicdisplay: 'opensheetmusicdisplay',
        PracticeBirdDeepLink: 'PracticeBirdDeepLink',
        externalsType: 'umd'
      },
    plugins: [... defaultConfig.plugins, 
        new CopyPlugin({
          patterns: [
            {from: 'node_modules/pb-deep-link/**/endpoint.min.js', to: 'pbdeeplink/endpoint.min.js'},
            {from: 'node_modules/pb-deep-link/**/qrcode.min.js', to: 'pbdeeplink/qrcode.min.js'},
            {from: 'node_modules/pb-deep-link/**/responsive_shim.min.css', to: 'pbdeeplink/responsive_shim.min.css'},
            {from: '**/*.json', to: '[name].json', context: 'src/'}
          ]
        })
    ]
}