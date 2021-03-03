const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
    ...defaultConfig,
    externals: {
        'opensheetmusicdisplay-wordpress-block': 'window["opensheetmusicdisplay-wordpress-block"]',
        opensheetmusicdisplay: 'opensheetmusicdisplay',
        externalsType: 'umd'
      }
}