const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require( 'path' );

module.exports = {
    ...defaultConfig,
    entry: {
      osmd_block: path.resolve( process.cwd(), 'src/osmd_block', 'index.js' ),
    },
    externals: {
        'opensheetmusicdisplay-wordpress-block': 'window["opensheetmusicdisplay-wordpress-block"]',
        opensheetmusicdisplay: 'opensheetmusicdisplay',
        externalsType: 'umd'
      }
}